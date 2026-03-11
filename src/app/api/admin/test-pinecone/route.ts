import { NextResponse } from 'next/server';
import { validatePineconeConnection, normalizeIndexName } from '../../../../lib/pinecone';

/**
 * GET /api/admin/test-pinecone
 * Test the current Pinecone credentials (from env). No request body.
 * PINECONE_INDEX should be the index name; if you paste the index host URL, it is normalized automatically.
 */
export async function GET() {
  try {
    const apiKey = process.env.PINECONE_API_KEY?.trim();
    const rawIndex = process.env.PINECONE_INDEX?.trim();
    if (!apiKey || !rawIndex) {
      return NextResponse.json({ ok: false, error: 'Pinecone not configured (set PINECONE_API_KEY, PINECONE_INDEX in Vercel)' });
    }
    const indexName = normalizeIndexName(rawIndex);
    if (!indexName) {
      return NextResponse.json({ ok: false, error: 'PINECONE_INDEX is invalid (use index name or index host URL)' });
    }
    const config = {
      apiKey,
      indexName,
      namespace: process.env.PINECONE_NAMESPACE ?? 'resume-chunks',
    };
    const result = await validatePineconeConnection(config);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Test failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
