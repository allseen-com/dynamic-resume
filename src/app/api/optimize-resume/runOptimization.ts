import { createAIService } from '../../../services/aiService';
import { ResumeData } from '../../../types/resume';
import { isPineconeConfigured, queryResumeChunks, cosineSimilarity } from '../../../lib/pinecone';
import { embedText } from '../../../utils/embeddings';
import { getResumeSummaryForMatch } from '../../../utils/chunkResume';
import { normalizeResumeDates } from '../../../utils/dateFormat';
import type { OptimizeJobResult } from '../../../lib/optimizeJobStore';
import { setJobCompleted, setJobFailed, setJobProgress } from '../../../lib/optimizeJobStore';
import type { PreAnalysisPayload } from './route';
import type { SectionPrompts } from '../../../utils/sectionPrompts';
import { SECTION_IDS } from '../../../utils/sectionPrompts';

const RAG_TOP_K = 15;

const SECTION_PROGRESS_LABELS: Record<(typeof SECTION_IDS)[number], string> = {
  headline: 'Optimizing headline / title bar…',
  summary: 'Optimizing professional summary…',
  technical: 'Optimizing technical skills…',
  experience: 'Optimizing work experience…',
};

export interface RunOptimizationInput {
  jobId: string;
  sectionPrompts: SectionPrompts;
  jobDescription: string;
  rawResumeData: ResumeData;
  preAnalysis?: PreAnalysisPayload;
  /** Target page count (1–5); used to set a word budget so the draft is shorter. */
  targetPages?: number;
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

export async function runOptimization(input: RunOptimizationInput): Promise<void> {
  const { jobId, sectionPrompts, jobDescription, rawResumeData, preAnalysis, targetPages } = input;
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

    for (const sectionId of SECTION_IDS) {
      setJobProgress(jobId, SECTION_PROGRESS_LABELS[sectionId]);
      const sectionPrompt = sectionPrompts[sectionId];
      const effectiveSectionPrompt = preAnalysisBlock ? `${sectionPrompt}\n\n${preAnalysisBlock}` : sectionPrompt;
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
      if ('professionalExperience' in fragment) {
        workingResume.professionalExperience = fragment.professionalExperience;
      }
    }

    setJobProgress(jobId, 'Finalizing and smoothing draft…');
    const targetWordBudget =
      targetPages != null && targetPages >= 1 && targetPages <= 5
        ? `\n\n**TARGET LENGTH (STRICT):** The final resume must not exceed approximately ${targetPages * WORDS_PER_PAGE} words (${targetPages} page(s)). Summarize and condense content to meet this limit while preserving impact. Prefer shorter, high-impact bullets over long paragraphs.\n\n`
        : '';
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
