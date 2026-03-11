import { NextResponse } from 'next/server';

/**
 * GET /api/admin/test-openai
 * Test the current AI provider credentials (from env). No request body.
 */
export async function GET() {
  try {
    const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
    let apiKey: string | undefined;
    switch (provider) {
      case 'openai':
        apiKey = process.env.OPENAI_API_KEY?.trim();
        break;
      case 'anthropic':
        apiKey = process.env.ANTHROPIC_API_KEY?.trim();
        break;
      case 'google':
        apiKey = process.env.GOOGLE_AI_API_KEY?.trim();
        break;
      case 'ollama':
        return NextResponse.json({ ok: true });
      default:
        apiKey = process.env.OPENAI_API_KEY?.trim();
    }
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'No API key set in environment' });
    }
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = (err as { error?: { message?: string } })?.error?.message || res.statusText;
        return NextResponse.json({ ok: false, error: message });
      }
      return NextResponse.json({ ok: true });
    }
    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = (err as { error?: { message?: string } })?.error?.message || res.statusText;
        return NextResponse.json({ ok: false, error: message });
      }
      return NextResponse.json({ ok: true });
    }
    if (provider === 'google') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hi' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message = (err as { error?: { message?: string } })?.error?.message || res.statusText;
        return NextResponse.json({ ok: false, error: message });
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Test failed';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
