import { createAIService } from '../../../services/aiService';
import { ResumeData } from '../../../types/resume';
import { isPineconeConfigured, queryResumeChunks, cosineSimilarity } from '../../../lib/pinecone';
import { embedText } from '../../../utils/embeddings';
import { getResumeSummaryForMatch } from '../../../utils/chunkResume';
import { normalizeResumeDates } from '../../../utils/dateFormat';
import type { OptimizeJobResult } from '../../../lib/optimizeJobStore';
import { setJobCompleted, setJobFailed, setJobProgress } from '../../../lib/optimizeJobStore';
import type { PreAnalysisPayload } from './route';
import type { SectionPrompts, SectionMaxWords } from '../../../utils/sectionPrompts';
import { SECTION_IDS_BASE, DEFAULT_EXPERIENCE_SINGLE } from '../../../utils/sectionPrompts';

const RAG_TOP_K = 15;

const SECTION_PROGRESS_LABELS: Record<(typeof SECTION_IDS_BASE)[number], string> = {
  headline: 'Optimizing headline / title bar…',
  summary: 'Optimizing professional summary…',
  technical: 'Optimizing technical skills…',
};

export interface RunOptimizationInput {
  jobId: string;
  sectionPrompts: SectionPrompts;
  jobDescription: string;
  rawResumeData: ResumeData;
  preAnalysis?: PreAnalysisPayload;
  /** Target page count (1–5); optional global cap. */
  targetPages?: number;
  /** Per-section max word count; applied to each section prompt and final step. */
  sectionMaxWords?: SectionMaxWords;
  /** Per-experience prompts (one per resume experience entry). Used when running experience_0, experience_1, … */
  experiencePrompts?: string[];
  /** Per-experience dynamic flag; false = keep original, true = run AI for that entry. */
  experienceDynamic?: boolean[];
}

function buildPreAnalysisBlock(preAnalysis: PreAnalysisPayload): string {
  const parts: string[] = [
    '--- Pre-analysis (use to focus optimization) ---',
    `Current match score: ${preAnalysis.matchScore ?? 'N/A'}%.`,
  ];
  if (preAnalysis.analysis) parts.push(`Analysis: ${preAnalysis.analysis}`);
  if (preAnalysis.gaps?.length) {
    parts.push('Identified gaps to address: ' + preAnalysis.gaps.join('; '));
  }
  if (preAnalysis.strengths?.length) {
    parts.push('Leverage these strengths: ' + preAnalysis.strengths.join('; '));
  }
  parts.push('--- End pre-analysis ---');
  return parts.join('\n');
}

const RAG_REQUIRED_MESSAGE =
  'Pinecone RAG is required for optimization. Configure PINECONE_API_KEY, PINECONE_INDEX (and optionally PINECONE_NAMESPACE), then index your resume from the Mother Resume page.';

/** Approximate words per A4 page for resume content. */
const WORDS_PER_PAGE = 400;

function getTargetPageGuidance(targetPages?: number): string {
  if (targetPages === 1) {
    return [
      '**LENGTH STRATEGY (1 PAGE):**',
      '- Keep only 2 detailed recent roles with concise, high-impact bullets.',
      '- Convert older experience into brief context lines with minimal detail.',
      '- Prioritize 2018-present achievements and measurable outcomes.',
    ].join('\n');
  }
  if (targetPages === 2) {
    return [
      '**LENGTH STRATEGY (2 PAGES):**',
      '- Keep strong detail for recent roles and compress older roles.',
      '- Target roughly 70% of experience detail on most recent relevant positions.',
      '- Preserve older roles primarily as context (titles, employers, dates).',
    ].join('\n');
  }
  return [
    '**LENGTH STRATEGY:**',
    '- Prioritize recent, role-relevant achievements first.',
    '- Compress older experience to protect space for senior-level impact.',
  ].join('\n');
}

export async function runOptimization(input: RunOptimizationInput): Promise<void> {
  const { jobId, sectionPrompts, jobDescription, rawResumeData, preAnalysis, targetPages, sectionMaxWords, experiencePrompts, experienceDynamic } = input;
  try {
    if (!isPineconeConfigured()) {
      setJobFailed(jobId, RAG_REQUIRED_MESSAGE);
      return;
    }
    setJobProgress(jobId, 'Analyzing job description and matching with your resume…');
    const resumeData = normalizeResumeDates(rawResumeData) as ResumeData;

    const preAnalysisBlock =
      preAnalysis && (preAnalysis.matchScore != null || preAnalysis.analysis || (preAnalysis.gaps?.length ?? 0) > 0 || (preAnalysis.strengths?.length ?? 0) > 0)
        ? buildPreAnalysisBlock(preAnalysis)
        : undefined;

    let matchScore: number | undefined;
    let matchScoreAfter: number | undefined;
    let jdVector: number[] | undefined;

    try {
      const resumeSummaryText = getResumeSummaryForMatch(resumeData);
      const [jdVec, resumeSummaryVector] = await Promise.all([
        embedText(jobDescription.slice(0, 8192)),
        embedText(resumeSummaryText.slice(0, 8192)),
      ]);
      jdVector = jdVec;
      matchScore = Math.round(cosineSimilarity(jdVec, resumeSummaryVector) * 100) / 100;
    } catch (embedError) {
      console.warn('Pre-optimization embeddings failed:', embedError);
      setJobFailed(jobId, 'Embedding service failed. Ensure OPENAI_API_KEY is set and valid.');
      return;
    }

    setJobProgress(jobId, 'Retrieving relevant experience from your resume…');
    let retrieved: Awaited<ReturnType<typeof queryResumeChunks>>;
    try {
      retrieved = await queryResumeChunks(jdVector!, RAG_TOP_K);
    } catch (pineconeError) {
      console.warn('Pinecone RAG query failed:', pineconeError);
      setJobFailed(jobId, RAG_REQUIRED_MESSAGE);
      return;
    }
    if (!retrieved.length) {
      setJobFailed(jobId, 'No resume chunks found. Index your resume from the Mother Resume page first.');
      return;
    }

    const ragBlock = [
      '--- Retrieved resume context (use for grounding; prioritize this content when customizing) ---',
      ...retrieved.map((r) => `[${r.metadata.section}${r.metadata.company ? ` | ${r.metadata.company}` : ''}] ${r.text.slice(0, 2000)}`),
      '--- End retrieved context ---',
    ].join('\n\n');
    const citations = retrieved.map((r) => ({
      chunkId: r.id,
      section: r.metadata.section,
      score: r.score,
    }));

    const workingResume: ResumeData = JSON.parse(JSON.stringify(resumeData));
    let workingTitleBar: { main: string; sub: string } | undefined;

    const aiService = createAIService();
    const experienceCount = workingResume.professionalExperience?.length ?? 0;
    const dynamicFlags = experienceDynamic && experienceDynamic.length >= experienceCount
      ? experienceDynamic
      : Array.from({ length: experienceCount }, () => true);
    const promptsByIndex = experiencePrompts && experiencePrompts.length >= experienceCount
      ? experiencePrompts
      : Array.from({ length: experienceCount }, () => DEFAULT_EXPERIENCE_SINGLE);

    for (const sectionId of SECTION_IDS_BASE) {
      setJobProgress(jobId, SECTION_PROGRESS_LABELS[sectionId]);
      const sectionPrompt = sectionPrompts[sectionId];
      const maxWords = sectionMaxWords?.[sectionId];
      const wordLimitLine =
        maxWords != null && maxWords > 0
          ? `\n\n**STRICT:** This section must not exceed ${maxWords} words.\n\n`
          : '';
      const effectiveSectionPrompt = [
        sectionPrompt,
        wordLimitLine,
        preAnalysisBlock ? preAnalysisBlock : '',
      ]
        .filter(Boolean)
        .join('\n');
      const fragment = await aiService.customizeSection(
        sectionId,
        jobDescription,
        workingResume,
        effectiveSectionPrompt,
        ragBlock,
        undefined
      );
      if ('titleBar' in fragment) {
        workingTitleBar = fragment.titleBar;
      }
      if ('summary' in fragment) {
        workingResume.summary = fragment.summary;
      }
      if ('coreCompetencies' in fragment && 'technicalProficiency' in fragment) {
        workingResume.coreCompetencies = fragment.coreCompetencies;
        workingResume.technicalProficiency = fragment.technicalProficiency;
      }
    }

    for (let i = 0; i < experienceCount; i++) {
      if (!dynamicFlags[i]) continue;
      setJobProgress(jobId, `Optimizing work experience ${i + 1}…`);
      const expSectionId = `experience_${i}`;
      const sectionPrompt = promptsByIndex[i] ?? DEFAULT_EXPERIENCE_SINGLE;
      const maxWords = sectionMaxWords?.experience;
      const wordLimitLine =
        maxWords != null && maxWords > 0
          ? `\n\n**STRICT:** This entry must stay concise; section total must not exceed ${maxWords} words.\n\n`
          : '';
      const effectiveSectionPrompt = [
        sectionPrompt,
        wordLimitLine,
        preAnalysisBlock ? preAnalysisBlock : '',
      ]
        .filter(Boolean)
        .join('\n');
      const fragment = await aiService.customizeSection(
        expSectionId,
        jobDescription,
        workingResume,
        effectiveSectionPrompt,
        ragBlock,
        undefined
      );
      if ('professionalExperience' in fragment && fragment.professionalExperience.length === 1) {
        workingResume.professionalExperience[i] = fragment.professionalExperience[0];
      }
    }

    setJobProgress(jobId, 'Finalizing and smoothing draft…');
    const finalMaxWords = sectionMaxWords?.final;
    const targetWordBudgetFromPages =
      targetPages != null && targetPages >= 1 && targetPages <= 5
        ? `\n\n**TARGET LENGTH (STRICT):** The final resume must not exceed approximately ${targetPages * WORDS_PER_PAGE} words (${targetPages} page(s)). Summarize and condense content to meet this limit while preserving impact. Prefer shorter, high-impact bullets over long paragraphs.\n\n${getTargetPageGuidance(targetPages)}\n\n`
        : '';
    const targetWordBudgetFromSection =
      finalMaxWords != null && finalMaxWords > 0
        ? `\n\n**TARGET LENGTH (STRICT):** The final resume must not exceed ${finalMaxWords} words. Summarize and condense content to meet this limit while preserving impact. Prefer shorter, high-impact bullets over long paragraphs.\n\n`
        : '';
    const targetWordBudget = targetWordBudgetFromSection || targetWordBudgetFromPages;
    const finalPrompt =
      (preAnalysisBlock ? `${sectionPrompts.final}\n\n${preAnalysisBlock}\n\n${ragBlock}` : `${sectionPrompts.final}\n\n${ragBlock}`) +
      targetWordBudget;
    const { resumeData: optimizedData, optimizationSummary, keyChanges } = await aiService.customizeResumeWithExplanation(
      jobDescription,
      workingResume,
      finalPrompt,
      workingTitleBar
    );

    const result: OptimizeJobResult = {
      success: true,
      data: optimizedData,
    };
    if (workingTitleBar) result.titleBar = workingTitleBar;
    if (matchScore != null) result.matchScore = matchScore;
    result.groundingVerified = true;
    if (citations?.length) result.citations = citations;
    if (optimizationSummary) result.optimizationSummary = optimizationSummary;
    if (keyChanges?.length) result.keyChanges = keyChanges;

    if (jdVector) {
      try {
        const optimizedSummaryText = getResumeSummaryForMatch(optimizedData);
        const optimizedVector = await embedText(optimizedSummaryText.slice(0, 8192));
        matchScoreAfter = Math.round(cosineSimilarity(jdVector, optimizedVector) * 100) / 100;
        result.matchScoreAfter = matchScoreAfter;
      } catch (e) {
        console.warn('Post-optimization score failed:', e);
      }
    }

    setJobCompleted(jobId, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Optimization failed';
    console.error('AI optimization failed:', error);
    setJobFailed(jobId, message);
  }
}
