import { NextResponse } from 'next/server';
import { validatePineconeConnection } from '../../../../lib/pinecone';

/**
 * GET /api/admin/test-pinecone
 * Test the current Pinecone credentials (from env). No request body.
 */
export async function GET() {
  try {
    const apiKey = process.env.PINECONE_API_KEY?.trim();
    const indexName = process.env.PINECONE_INDEX?.trim();
    if (!apiKey || !indexName) {
      return NextResponse.json({ ok: false, error: 'Pinecone not configured (set PINECONE_API_KEY, PINECONE_INDEX in Vercel)' });
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
