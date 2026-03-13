import { NextRequest, NextResponse } from 'next/server';
import { chunkResume } from '../../../utils/chunkResume';
import { upsertResumeChunks, deleteNamespace } from '../../../lib/pinecone';
import type { ResumeData } from '../../../types/resume';
import { isPineconeConfigured } from '../../../lib/pinecone';

/**
 * POST /api/embed-draft
 * Chunk the drafted resume, generate embeddings, and upsert into Pinecone under a custom namespace (draft-{draftId}).
 * This allows recalculating match score and later deleting the draft from the index.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isPineconeConfigured()) {
      return NextResponse.json(
        { error: 'Pinecone is required. Configure PINECONE_* and try again.' },
        { status: 503 }
      );
    }
    const body = await request.json();
    const resumeData = body.resumeData as ResumeData | undefined;
    const draftId = (typeof body.draftId === 'string' && body.draftId.trim()) || crypto.randomUUID();
    const namespace = `draft-${draftId.replace(/[^a-zA-Z0-9-_]/g, '')}`;

    if (!resumeData || typeof resumeData !== 'object') {
      return NextResponse.json(
        { error: 'Missing resumeData in request body' },
        { status: 400 }
      );
    }

    const chunks = chunkResume(resumeData);
    const { upsertedCount } = await upsertResumeChunks(chunks, { namespace });

    return NextResponse.json({
      success: true,
      draftId,
      namespace,
      chunksCount: chunks.length,
      upsertedCount,
    });
  } catch (error) {
    console.error('Embed draft failed:', error);
    const message = error instanceof Error ? error.message : 'Embed draft failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/embed-draft?draftId=xxx
 * Delete all vectors in the draft namespace so the draft can be removed from the index.
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!isPineconeConfigured()) {
      return NextResponse.json(
        { error: 'Pinecone is not configured' },
        { status: 503 }
      );
    }
    const draftId = request.nextUrl.searchParams.get('draftId');
    if (!draftId || !draftId.trim()) {
      return NextResponse.json(
        { error: 'Missing draftId query parameter' },
        { status: 400 }
      );
    }
    const namespace = `draft-${draftId.replace(/[^a-zA-Z0-9-_]/g, '')}`;
    await deleteNamespace(namespace);
    return NextResponse.json({ success: true, deleted: namespace });
  } catch (error) {
    console.error('Delete draft failed:', error);
    const message = error instanceof Error ? error.message : 'Delete draft failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
