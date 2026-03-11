import { NextResponse } from 'next/server';
import { isPineconeConfigured } from '../../../../lib/pinecone';

/**
 * GET /api/admin/credentials-status
 * Single endpoint for Admin page: OpenAI (or AI provider) and Pinecone status. No secrets.
 */
export async function GET() {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();
  let aiConfigured = false;
  let providerName = provider;

  switch (provider) {
    case 'openai':
      aiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());
      providerName = 'OpenAI';
      break;
    case 'anthropic':
      aiConfigured = Boolean(process.env.ANTHROPIC_API_KEY?.trim());
      providerName = 'Anthropic';
      break;
    case 'google':
      aiConfigured = Boolean(process.env.GOOGLE_AI_API_KEY?.trim());
      providerName = 'Google AI';
      break;
    case 'ollama':
      aiConfigured = true;
      providerName = 'Ollama';
      break;
    default:
      aiConfigured = Boolean(process.env.OPENAI_API_KEY?.trim());
      providerName = 'OpenAI';
  }

  const pineconeConfigured = isPineconeConfigured();

  return NextResponse.json({
    openai: {
      configured: aiConfigured,
      provider: providerName,
      providerId: provider,
    },
    pinecone: {
      configured: pineconeConfigured,
      indexName: pineconeConfigured ? process.env.PINECONE_INDEX : undefined,
      namespace: process.env.PINECONE_NAMESPACE ?? 'resume-chunks',
    },
  });
}
