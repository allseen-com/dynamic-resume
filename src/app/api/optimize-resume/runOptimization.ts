import { createAIService } from '../../../services/aiService';
import { ResumeData } from '../../../types/resume';
import { isPineconeConfigured, queryResumeChunks, cosineSimilarity } from '../../../lib/pinecone';
import { embedText } from '../../../utils/embeddings';
import { getResumeSummaryForMatch } from '../../../utils/chunkResume';
import { normalizeResumeDates } from '../../../utils/dateFormat';
import type { OptimizeJobResult } from '../../../lib/optimizeJobStore';
import { setJobCompleted, setJobFailed } from '../../../lib/optimizeJobStore';

const RAG_TOP_K = 15;

export interface RunOptimizationInput {
  jobId: string;
  prompt: string;
  jobDescription: string;
  rawResumeData: ResumeData;
}

export async function runOptimization(input: RunOptimizationInput): Promise<void> {
  const { jobId, prompt, jobDescription, rawResumeData } = input;
  try {
    const resumeData = normalizeResumeDates(rawResumeData) as ResumeData;

    let effectivePrompt = prompt;
    let matchScore: number | undefined;
    let groundingVerified = false;
    let citations: { chunkId: string; section: string; score?: number }[] | undefined;

    if (isPineconeConfigured()) {
      try {
        const [jdVector, resumeSummaryText] = await Promise.all([
          embedText(jobDescription.slice(0, 8192)),
          Promise.resolve(getResumeSummaryForMatch(resumeData)),
        ]);
        const resumeSummaryVector = await embedText(resumeSummaryText.slice(0, 8192));
        matchScore = Math.round(cosineSimilarity(jdVector, resumeSummaryVector) * 100) / 100;

        const retrieved = await queryResumeChunks(jdVector, RAG_TOP_K);
        if (retrieved.length > 0) {
          groundingVerified = true;
          const ragBlock = [
            '--- Retrieved resume context (use for grounding; prioritize this content when customizing) ---',
            ...retrieved.map((r) => `[${r.metadata.section}${r.metadata.company ? ` | ${r.metadata.company}` : ''}] ${r.text.slice(0, 2000)}`),
            '--- End retrieved context ---',
          ].join('\n\n');
          effectivePrompt = `${prompt}\n\n${ragBlock}\n\n`;
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

    const aiService = createAIService();
    const optimizedData = await aiService.customizeResume(jobDescription, resumeData, effectivePrompt);

    const result: OptimizeJobResult = {
      success: true,
      data: optimizedData,
    };
    if (matchScore != null) result.matchScore = matchScore;
    if (groundingVerified) result.groundingVerified = groundingVerified;
    if (citations?.length) result.citations = citations;

    setJobCompleted(jobId, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Optimization failed';
    console.error('AI optimization failed:', error);
    setJobFailed(jobId, message);
  }
}
