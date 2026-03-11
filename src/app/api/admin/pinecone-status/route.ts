import { NextResponse } from 'next/server';
import { isPineconeConfigured } from '../../../../lib/pinecone';

/**
 * GET /api/admin/pinecone-status
 * Returns whether Pinecone is configured (env vars set). Does not expose secrets.
 */
export async function GET() {
  const configured = isPineconeConfigured();
  return NextResponse.json({
    configured,
    indexName: configured ? process.env.PINECONE_INDEX : undefined,
    namespace: process.env.PINECONE_NAMESPACE ?? 'resume-chunks',
  });
}
