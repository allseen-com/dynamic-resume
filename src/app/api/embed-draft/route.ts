import { NextRequest, NextResponse } from 'next/server';
import { chunkResume } from '../../../utils/chunkResume';
import {
  upsertResumeChunks,
  deleteNamespace,
  isPineconeConfigured,
  pineconeDraftNamespace,
} from '../../../lib/pinecone';
import type { ResumeData } from '../../../types/resume';

/**
 * Normalize draft resume data so chunkResume never sees invalid types (e.g. AI returning description as string).
 */
function normalizeDraftResumeData(raw: unknown): ResumeData {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid draft resume shape for chunking');
  }
  const data = raw as Record<string, unknown>;
  const professionalExperience = data.professionalExperience;
  const normalizedExperience = Array.isArray(professionalExperience)
    ? professionalExperience.map((exp: unknown) => {
        if (!exp || typeof exp !== 'object') return { company: '', title: '', dateRange: '', description: { _dynamic: true, value: '' } };
        const e = exp as Record<string, unknown>;
        const desc = e.description;
        const descriptionValue =
          desc != null && typeof desc === 'object' && 'value' in desc && typeof (desc as { value: unknown }).value === 'string'
            ? (desc as { value: string }).value
            : typeof desc === 'string'
              ? desc
              : '';
        return {
          ...e,
          company: typeof e.company === 'string' ? e.company : '',
          title: typeof e.title === 'string' ? e.title : '',
          dateRange: typeof e.dateRange === 'string' ? e.dateRange : '',
          description: { _dynamic: true, value: descriptionValue },
        };
      })
    : [];
  return { ...data, professionalExperience: normalizedExperience } as ResumeData;
}

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
    const rawResumeData = body.resumeData;
    const draftId = (typeof body.draftId === 'string' && body.draftId.trim()) || crypto.randomUUID();
    const namespace = pineconeDraftNamespace(draftId);

    if (!rawResumeData || typeof rawResumeData !== 'object') {
      return NextResponse.json(
        { error: 'Missing resumeData in request body' },
        { status: 400 }
      );
    }

    let resumeData: ResumeData;
    try {
      resumeData = normalizeDraftResumeData(rawResumeData);
    } catch (normError) {
      const message = normError instanceof Error ? normError.message : 'Invalid draft resume shape for chunking';
      return NextResponse.json(
        { error: message },
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
    const namespace = pineconeDraftNamespace(draftId);
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
