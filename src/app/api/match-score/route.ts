import { NextRequest, NextResponse } from 'next/server';
import { ResumeData } from '../../../types/resume';
import { embedText } from '../../../utils/embeddings';
import { cosineSimilarity } from '../../../lib/pinecone';
import { getResumeSummaryForMatch } from '../../../utils/chunkResume';
import { normalizeResumeDates } from '../../../utils/dateFormat';
import { isPineconeConfigured, queryResumeChunks } from '../../../lib/pinecone';
import { createAIService } from '../../../services/aiService';

const ATS_BANDS = `
ATS score bands (for context):
- 0-60%: Danger Zone — high probability of auto-rejection; keyword gaps or parseability issues.
- 61-79%: Needs Work — resume is parseable but may rank below stronger matches.
- 80-100%: Interview Ready — strong semantic and keyword alignment; likely to surface for human review.
`;

export interface MatchScoreResponse {
  matchScore: number;
  analysis?: string;
  strengths?: string[];
  gaps?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobDescription, resumeData: rawResumeData } = body as {
      jobDescription: string;
      resumeData?: ResumeData;
    };

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid jobDescription' },
        { status: 400 }
      );
    }

    if (!rawResumeData) {
      return NextResponse.json(
        { error: 'Missing resumeData' },
        { status: 400 }
      );
    }

    if (!isPineconeConfigured()) {
      return NextResponse.json(
        {
          error: 'Pinecone required',
          message: 'Pinecone is required for match score. Configure PINECONE_API_KEY, PINECONE_INDEX, and index your resume from the Mother Resume page.',
        },
        { status: 503 }
      );
    }

    const resumeData = normalizeResumeDates(rawResumeData) as ResumeData;
    const resumeSummaryText = getResumeSummaryForMatch(resumeData);

    let matchScorePct = 0;
    let jdVector: number[] | undefined;

    try {
      const [jdVec, resumeSummaryVector] = await Promise.all([
        embedText(jobDescription.trim().slice(0, 8192)),
        embedText(resumeSummaryText.slice(0, 8192)),
      ]);
      jdVector = jdVec;
      const rawScore = cosineSimilarity(jdVec, resumeSummaryVector);
      matchScorePct = Math.round(rawScore * 100);
    } catch (embedError) {
      console.warn('Match-score embeddings failed:', embedError);
      return NextResponse.json(
        {
          error: 'Score unavailable',
          message: 'Embeddings service is not configured or failed. Set OPENAI_API_KEY to enable match score.',
        },
        { status: 503 }
      );
    }

    let analysis: string | undefined;
    let strengths: string[] | undefined;
    let gaps: string[] | undefined;

    let ragContext = '';
    try {
      const retrieved = await queryResumeChunks(jdVector!, 8);
      if (retrieved.length > 0) {
        ragContext =
          '\n\nRelevant resume excerpts (for context):\n' +
          retrieved
            .map(
              (r) =>
                `[${r.metadata.section}${r.metadata.company ? ` | ${r.metadata.company}` : ''}] ${r.text.slice(0, 800)}`
            )
            .join('\n\n---\n\n');
      }
    } catch (ragError) {
      console.warn('Match-score RAG query failed:', ragError);
      return NextResponse.json(
        {
          error: 'RAG unavailable',
          message: 'Could not retrieve resume context. Ensure your resume is indexed from the Mother Resume page.',
        },
        { status: 503 }
      );
    }

    try {
      const aiService = createAIService();
      const prompt = `You are an ATS and recruitment expert. Given the job description, the candidate's resume summary, and the computed match score, provide a brief analysis.

Job description (excerpt):
${jobDescription.trim().slice(0, 3000)}

Resume summary used for matching:
${resumeSummaryText.slice(0, 2000)}
${ragContext}

Computed match score: ${matchScorePct}%
${ATS_BANDS}

Respond with a JSON object only, no markdown or extra text:
{
  "analysis": "1-2 sentences explaining why the score is what it is (keyword alignment, relevance, gaps).",
  "strengths": ["2-4 short bullet points of resume strengths for this role"],
  "gaps": ["2-4 short bullet points of gaps or areas to improve for this role"]
}
Keep each bullet concise (under 15 words).`;

      const raw = await aiService.generateText(prompt);
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as {
          analysis?: string;
          strengths?: string[];
          gaps?: string[];
        };
        analysis = parsed.analysis;
        strengths = Array.isArray(parsed.strengths) ? parsed.strengths : undefined;
        gaps = Array.isArray(parsed.gaps) ? parsed.gaps : undefined;
      }
    } catch (llmError) {
      console.warn('Match-score LLM analysis failed:', llmError);
      // still return score
    }

    const response: MatchScoreResponse = {
      matchScore: matchScorePct,
    };
    if (analysis) response.analysis = analysis;
    if (strengths?.length) response.strengths = strengths;
    if (gaps?.length) response.gaps = gaps;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Match-score API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Match score failed' },
      { status: 500 }
    );
  }
}
