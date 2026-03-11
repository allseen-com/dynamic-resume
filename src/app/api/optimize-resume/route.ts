import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '../../../services/aiService';
import { ResumeData } from '../../../types/resume';
import { isPineconeConfigured, queryResumeChunks, cosineSimilarity } from '../../../lib/pinecone';
import { embedText } from '../../../utils/embeddings';
import { getResumeSummaryForMatch } from '../../../utils/chunkResume';

const RAG_TOP_K = 15;

export async function POST(request: NextRequest) {
  try {
    const { prompt, jobDescription, resumeData }: {
      prompt: string;
      jobDescription: string;
      resumeData: ResumeData;
    } = await request.json();

    if (!prompt || !jobDescription || !resumeData) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, jobDescription, or resumeData' },
        { status: 400 }
      );
    }

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

    const payload: {
      success: boolean;
      data: ResumeData;
      matchScore?: number;
      groundingVerified?: boolean;
      citations?: { chunkId: string; section: string; score?: number }[];
    } = {
      success: true,
      data: optimizedData,
    };
    if (matchScore != null) payload.matchScore = matchScore;
    if (groundingVerified) payload.groundingVerified = groundingVerified;
    if (citations?.length) payload.citations = citations;

    return NextResponse.json(payload);
  } catch (error) {
    console.error('AI optimization failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Optimization failed',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}