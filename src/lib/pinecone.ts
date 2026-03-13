import { Pinecone } from '@pinecone-database/pinecone';
import type { ResumeChunk } from '../utils/chunkResume';
import { embedTexts } from '../utils/embeddings';

export interface PineconeConfig {
  apiKey: string;
  indexName: string;
  namespace: string;
}

/**
 * PINECONE_INDEX must be the index name (e.g. "my-index"), not the index host URL.
 * If the user pasted the host URL (e.g. https://my-index-xxx.svc.region.pinecone.io),
 * we derive the index name from the host so describeIndex() and data operations work.
 */
export function normalizeIndexName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  try {
    const url = trimmed.startsWith('http') ? new URL(trimmed) : new URL(`https://${trimmed}`);
    const host = url.hostname;
    // Host format: <index-id>.svc.<region>.pinecone.io → use part before .svc. as index name
    if (host.endsWith('.pinecone.io') && host.includes('.svc.')) {
      const beforeSvc = host.split('.svc.')[0];
      if (beforeSvc) return beforeSvc;
    }
  } catch {
    // not a URL, use as-is (index name)
  }
  return trimmed;
}

function getConfig(): PineconeConfig | null {
  const apiKey = process.env.PINECONE_API_KEY;
  const rawIndex = process.env.PINECONE_INDEX;
  const namespace = process.env.PINECONE_NAMESPACE ?? 'resume-chunks';
  if (!apiKey || !rawIndex) return null;
  const indexName = normalizeIndexName(rawIndex);
  if (!indexName) return null;
  return { apiKey, indexName, namespace };
}

export function isPineconeConfigured(): boolean {
  return getConfig() !== null;
}

let _client: Pinecone | null = null;

function getClient(config: PineconeConfig): Pinecone {
  if (!_client) {
    _client = new Pinecone({ apiKey: config.apiKey });
  }
  return _client;
}

/** Cache index name -> host so we don't call listIndexes on every upsert/query. */
let _indexHostCache: { name: string; host: string } | null = null;

/**
 * Resolve the index host via listIndexes (avoids control-plane describeIndex which can 404).
 * Uses the same logic as validatePineconeConnection so embed/query work when test works.
 */
async function resolveIndexHost(client: Pinecone, indexName: string): Promise<string> {
  if (_indexHostCache?.name === indexName) return _indexHostCache.host;
  const list = await client.listIndexes();
  const indexes = list?.indexes ?? [];
  const match =
    indexes.find((i) => i.name === indexName) ??
    indexes.find((i) => i.host?.includes(indexName));
  if (!match) {
    const names = indexes.length ? indexes.map((i) => i.name).join(', ') : 'none';
    throw new Error(`Index "${indexName}" not found. Available: ${names}. Check PINECONE_INDEX.`);
  }
  const host = match.host ?? match.name;
  if (!host) throw new Error('Index has no host; index may not be ready.');
  _indexHostCache = { name: match.name, host };
  return host;
}

/** SDK v4: index(name, host) to skip describeIndex; typings only allow index(name). */
function getIndexWithHost(
  client: Pinecone,
  indexName: string,
  host: string,
  namespace: string
): ReturnType<Pinecone['index']> {
  const index = (client as unknown as { index: (name: string, host: string) => ReturnType<Pinecone['index']> }).index(indexName, host);
  return index.namespace(namespace) as ReturnType<Pinecone['index']>;
}

/**
 * Upsert resume chunks into Pinecone. Embeds each chunk and stores with metadata.
 */
export async function upsertResumeChunks(
  chunks: ResumeChunk[],
  configOverride?: Partial<PineconeConfig>
): Promise<{ upsertedCount: number }> {
  const raw = configOverride ?? getConfig();
  if (!raw?.apiKey || !raw?.indexName) throw new Error('Pinecone is not configured (PINECONE_API_KEY, PINECONE_INDEX)');
  const config: PineconeConfig = {
    apiKey: raw.apiKey,
    indexName: raw.indexName,
    namespace: raw.namespace ?? 'resume-chunks',
  };

  const texts = chunks.map((c) => c.text);
  const vectors = await embedTexts(texts);

  const client = getClient(config);
  const host = await resolveIndexHost(client, config.indexName);
  const index = getIndexWithHost(client, config.indexName, host, config.namespace);

  const records = chunks.map((chunk, i) => ({
    id: chunk.id,
    values: vectors[i],
    metadata: {
      section: chunk.metadata.section,
      text: chunk.text.slice(0, 40_000), // Pinecone metadata limit
      ...(chunk.metadata.index != null && { index: chunk.metadata.index }),
      ...(chunk.metadata.company && { company: chunk.metadata.company }),
      ...(chunk.metadata.title && { title: chunk.metadata.title }),
      ...(chunk.metadata.dateRange && { dateRange: chunk.metadata.dateRange }),
    },
  }));

  await index.upsert(records);
  return { upsertedCount: records.length };
}

/**
 * Delete all vectors in a namespace (e.g. draft-{draftId}).
 * Use when removing an indexed draft from the site.
 * Uses Pinecone data-plane REST API.
 */
export async function deleteNamespace(
  namespace: string,
  configOverride?: Partial<PineconeConfig>
): Promise<void> {
  const raw = configOverride ?? getConfig();
  if (!raw?.apiKey || !raw?.indexName) throw new Error('Pinecone is not configured');
  const apiKey = raw.apiKey as string;
  const indexName = raw.indexName as string;
  const config: PineconeConfig = { apiKey, indexName, namespace: raw.namespace ?? 'resume-chunks' };
  const client = getClient(config);
  const host = await resolveIndexHost(client, indexName);
  const url = `https://${host}/vectors/delete`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Api-Key': apiKey,
      'Content-Type': 'application/json',
      'X-Pinecone-Api-Version': '2024-10',
    },
    body: JSON.stringify({ deleteAll: true, namespace }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone delete failed: ${res.status} ${err}`);
  }
}

export interface RetrievedChunk {
  id: string;
  text: string;
  score: number;
  metadata: ResumeChunk['metadata'];
}

/**
 * Query Pinecone for top-k resume chunks similar to the query vector (e.g. job description).
 */
export async function queryResumeChunks(
  queryVector: number[],
  topK: number = 15,
  configOverride?: Partial<PineconeConfig>
): Promise<RetrievedChunk[]> {
  const raw = configOverride ?? getConfig();
  if (!raw?.apiKey || !raw?.indexName) throw new Error('Pinecone is not configured');
  const config: PineconeConfig = {
    apiKey: raw.apiKey,
    indexName: raw.indexName,
    namespace: raw.namespace ?? 'resume-chunks',
  };

  const client = getClient(config);
  const host = await resolveIndexHost(client, config.indexName);
  const index = getIndexWithHost(client, config.indexName, host, config.namespace);

  const res = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  const matches = res.matches ?? [];
  return matches
    .filter((m): m is typeof m & { score: number; metadata?: Record<string, unknown> } => m.score != null && m.metadata != null)
    .map((m) => ({
      id: m.id ?? '',
      text: (m.metadata?.text as string) ?? '',
      score: m.score,
      metadata: {
        section: (m.metadata?.section as string) ?? 'unknown',
        index: m.metadata?.index as number | undefined,
        company: m.metadata?.company as string | undefined,
        title: m.metadata?.title as string | undefined,
        dateRange: m.metadata?.dateRange as string | undefined,
      },
    }));
}

/**
 * Validate Pinecone connection and index/namespace (for admin).
 * Uses listIndexes + data-plane describeIndexStats so validation works even when
 * the control-plane describeIndex returns 404 (e.g. some serverless/index names).
 */
export async function validatePineconeConnection(
  config: PineconeConfig
): Promise<{ ok: boolean; error?: string }> {
  try {
    const client = new Pinecone({ apiKey: config.apiKey });
    const list = await client.listIndexes();
    const indexes = list?.indexes ?? [];
    const match =
      indexes.find((i) => i.name === config.indexName) ??
      indexes.find((i) => i.host?.includes(config.indexName));
    if (!match) {
      const names = indexes.length ? indexes.map((i) => i.name).join(', ') : 'none';
      return {
        ok: false,
        error: `Index "${config.indexName}" not found in this project. Available: ${names}. Check PINECONE_INDEX matches the index name in Pinecone console.`,
      };
    }
    const host = match.host ?? match.name;
    if (!host) {
      return { ok: false, error: 'Index has no host; index may not be ready.' };
    }
    // SDK v4: index(name, host) — pass host so we skip control-plane describeIndex (which can 404)
    const index = (client as unknown as { index: (name: string, host: string) => { describeIndexStats: () => Promise<unknown> } }).index(match.name, host);
    await index.describeIndexStats();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

/**
 * Compute cosine similarity between two vectors (for MatchScore).
 * Returns value in [0, 1] when using normalized vectors; OpenAI embeddings are normalized.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  const sim = dot / denom;
  // Normalize from [-1,1] to [0,1] for display as percentage
  return Math.max(0, (sim + 1) / 2);
}
