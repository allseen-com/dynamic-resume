import OpenAI from 'openai';

const model = 'text-embedding-3-small';
const dimensions = 1536;

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is required for embeddings');
    _client = new OpenAI({ apiKey: key });
  }
  return _client;
}

/**
 * Get embedding vector for a single text (e.g. job description or resume summary).
 */
export async function embedText(text: string): Promise<number[]> {
  const client = getClient();
  const res = await client.embeddings.create({
    model,
    input: text.slice(0, 8192), // limit input length
    dimensions,
  });
  const embedding = res.data[0]?.embedding;
  if (!embedding) throw new Error('No embedding returned');
  return embedding;
}

/**
 * Get embeddings for multiple texts in one request (batch).
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const client = getClient();
  const input = texts.map((t) => t.slice(0, 8192));
  const res = await client.embeddings.create({
    model,
    input,
    dimensions,
  });
  const byIndex = new Map<number, number[]>();
  for (const item of res.data) {
    if (item.embedding != null && item.index != null) {
      byIndex.set(item.index, item.embedding);
    }
  }
  return input.map((_, i) => {
    const emb = byIndex.get(i);
    if (!emb) throw new Error(`Missing embedding for index ${i}`);
    return emb;
  });
}

export const EMBEDDING_DIMENSIONS = dimensions;
