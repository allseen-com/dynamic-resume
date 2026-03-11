import { NextRequest, NextResponse } from 'next/server';
import { validatePineconeConnection } from '../../../../lib/pinecone';

/**
 * POST /api/admin/pinecone-validate
 * Validate Pinecone credentials (API key + index). Does not persist; use .env for persistence.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, indexName, namespace } = body as {
      apiKey?: string;
      indexName?: string;
      namespace?: string;
    };
    if (!apiKey?.trim() || !indexName?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'apiKey and indexName are required' },
        { status: 400 }
      );
    }
    const result = await validatePineconeConnection({
      apiKey: apiKey.trim(),
      indexName: indexName.trim(),
      namespace: (namespace?.trim() as string) || 'resume-chunks',
    });
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
