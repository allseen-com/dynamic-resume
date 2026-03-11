import { NextRequest, NextResponse } from 'next/server';
import { chunkResume } from '../../../utils/chunkResume';
import { upsertResumeChunks } from '../../../lib/pinecone';
import type { ResumeData } from '../../../types/resume';

/**
 * POST /api/embed-resume
 * Chunk the Mother Resume, generate embeddings, and upsert into Pinecone.
 * Call this once (or when resume data changes) to build the vector index for RAG.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resumeData = body.resumeData as ResumeData | undefined;
    if (!resumeData) {
      return NextResponse.json(
        { error: 'Missing resumeData in request body' },
        { status: 400 }
      );
    }

    const chunks = chunkResume(resumeData);
    const { upsertedCount } = await upsertResumeChunks(chunks);

    return NextResponse.json({
      success: true,
      chunksCount: chunks.length,
      upsertedCount,
    });
  } catch (error) {
    console.error('Embed resume failed:', error);
    const message = error instanceof Error ? error.message : 'Embed resume failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
