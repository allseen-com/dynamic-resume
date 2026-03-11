import { NextResponse } from 'next/server';

/**
 * GET /api/admin/openai-status
 * Returns whether OpenAI (or configured AI provider) has env credentials. Does not expose secrets.
 */
export async function GET() {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
  let configured = false;
  let providerName = provider;

  switch (provider) {
    case 'openai':
      configured = Boolean(process.env.OPENAI_API_KEY?.trim());
      providerName = 'OpenAI';
      break;
    case 'anthropic':
      configured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
      providerName = 'Anthropic';
      break;
    case 'google':
      configured = Boolean(process.env.GOOGLE_AI_API_KEY?.trim());
      providerName = 'Google AI';
      break;
    case 'ollama':
      configured = true; // no key required
      providerName = 'Ollama';
      break;
    default:
      configured = Boolean(process.env.OPENAI_API_KEY?.trim());
      providerName = 'OpenAI';
  }

  return NextResponse.json({
    configured,
    provider: providerName,
    providerId: provider,
  });
}
