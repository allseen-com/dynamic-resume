import { createAIService } from '../../../services/aiService';
import { ResumeData } from '../../../types/resume';
import { isPineconeConfigured, queryResumeChunks, cosineSimilarity } from '../../../lib/pinecone';
import { embedText } from '../../../utils/embeddings';
import { getResumeSummaryForMatch } from '../../../utils/chunkResume';
import { normalizeResumeDates } from '../../../utils/dateFormat';
import type { OptimizeJobResult } from '../../../lib/optimizeJobStore';
import { setJobCompleted, setJobFailed, setJobProgress } from '../../../lib/optimizeJobStore';
import type { PreAnalysisPayload } from './route';

const RAG_TOP_K = 15;

export interface RunOptimizationInput {
  jobId: string;
  prompt: string;
  jobDescription: string;
  rawResumeData: ResumeData;
  preAnalysis?: PreAnalysisPayload;
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

export async function runOptimization(input: RunOptimizationInput): Promise<void> {
  const { jobId, prompt, jobDescription, rawResumeData, preAnalysis } = input;
  try {
    setJobProgress(jobId, 'Analyzing job description and matching with your resume…');
    const resumeData = normalizeResumeDates(rawResumeData) as ResumeData;

    let effectivePrompt = prompt;
    // When user ran "Calculate Score", inject pre-analysis (score, strengths, gaps) so the model addresses gaps and leverages strengths.
    if (preAnalysis && (preAnalysis.matchScore != null || preAnalysis.analysis || (preAnalysis.gaps?.length ?? 0) > 0 || (preAnalysis.strengths?.length ?? 0) > 0)) {
      effectivePrompt = `${prompt}\n\n${buildPreAnalysisBlock(preAnalysis)}\n\n`;
    }
    let matchScore: number | undefined;
    let matchScoreAfter: number | undefined;
    let jdVector: number[] | null = null;
    let groundingVerified = false;
    let citations: { chunkId: string; section: string; score?: number }[] | undefined;

    try {
      const resumeSummaryText = getResumeSummaryForMatch(resumeData);
      const [jdVec, resumeSummaryVector] = await Promise.all([
        embedText(jobDescription.slice(0, 8192)),
        embedText(resumeSummaryText.slice(0, 8192)),
      ]);
      jdVector = jdVec;
      matchScore = Math.round(cosineSimilarity(jdVec, resumeSummaryVector) * 100) / 100;
    } catch (embedError) {
      console.warn('Pre-optimization embeddings failed (before/after scores unavailable):', embedError);
    }

    if (isPineconeConfigured() && jdVector) {
      try {
        setJobProgress(jobId, 'Retrieving relevant experience from your resume…');
        const retrieved = await queryResumeChunks(jdVector, RAG_TOP_K);
        if (retrieved.length > 0) {
          groundingVerified = true;
          const ragBlock = [
            '--- Retrieved resume context (use for grounding; prioritize this content when customizing) ---',
            ...retrieved.map((r) => `[${r.metadata.section}${r.metadata.company ? ` | ${r.metadata.company}` : ''}] ${r.text.slice(0, 2000)}`),
            '--- End retrieved context ---',
          ].join('\n\n');
          effectivePrompt = `${effectivePrompt}\n\n${ragBlock}\n\n`;
          citations = retrieved.map((r) => ({
            chunkId: r.id,
            section: r.metadata.section,
            score: r.score,
          }));
        }
      } catch (pineconeError) {
        console.warn('Pinecone RAG failed, continuing without:', pineconeError);
      }
    }

    setJobProgress(jobId, 'Customizing summary, competencies, and experience…');
    const aiService = createAIService();
    const { resumeData: optimizedData, optimizationSummary, keyChanges } = await aiService.customizeResumeWithExplanation(
      jobDescription,
      resumeData,
      effectivePrompt
    );

    const result: OptimizeJobResult = {
      success: true,
      data: optimizedData,
    };
    if (matchScore != null) result.matchScore = matchScore;
    if (groundingVerified) result.groundingVerified = groundingVerified;
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

    setJobProgress(jobId, 'Finalizing optimized resume…');
    setJobCompleted(jobId, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Optimization failed';
    console.error('AI optimization failed:', error);
    setJobFailed(jobId, message);
  }
}
