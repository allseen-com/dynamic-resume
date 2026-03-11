import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/admin/openai-validate
 * Validate OpenAI API key by calling the models list endpoint. Does not persist.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey } = body as { apiKey?: string };
    if (!apiKey?.trim()) {
      return NextResponse.json(
        { ok: false, error: 'apiKey is required' },
        { status: 400 }
      );
    }

    const res = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message = (err as { error?: { message?: string } })?.error?.message || res.statusText || `HTTP ${res.status}`;
      return NextResponse.json({ ok: false, error: message });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Validation failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
