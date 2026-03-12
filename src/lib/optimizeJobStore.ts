/**
 * In-memory store for async optimize-resume jobs (202 pattern).
 * For production multi-instance (e.g. Vercel), consider Vercel KV or Redis
 * so status polling sees the same job state across instances.
 */
export type JobStatus = 'pending' | 'completed' | 'failed';

export interface OptimizeJobResult {
  success: boolean;
  data: import('../types/resume').ResumeData;
  matchScore?: number;
  matchScoreAfter?: number;
  groundingVerified?: boolean;
  citations?: { chunkId: string; section: string; score?: number }[];
  optimizationSummary?: string;
  keyChanges?: string[];
}

export interface OptimizeJobState {
  status: JobStatus;
  result?: OptimizeJobResult;
  error?: string;
  statusMessage?: string;
  createdAt: number;
}

const jobs = new Map<string, OptimizeJobState>();

const TTL_MS = 30 * 60 * 1000; // 30 min

function prune() {
  const now = Date.now();
  for (const [id, state] of jobs.entries()) {
    if (state.status !== 'pending' && now - state.createdAt > TTL_MS) jobs.delete(id);
  }
}

export function setJobPending(jobId: string): void {
  prune();
  jobs.set(jobId, { status: 'pending', createdAt: Date.now() });
}

export function setJobProgress(jobId: string, statusMessage: string): void {
  const state = jobs.get(jobId);
  if (state && state.status === 'pending') {
    jobs.set(jobId, { ...state, statusMessage });
  }
}

export function setJobCompleted(jobId: string, result: OptimizeJobResult): void {
  jobs.set(jobId, {
    status: 'completed',
    result,
    createdAt: (jobs.get(jobId)?.createdAt) ?? Date.now(),
  });
}

export function setJobFailed(jobId: string, error: string): void {
  jobs.set(jobId, {
    status: 'failed',
    error,
    createdAt: (jobs.get(jobId)?.createdAt) ?? Date.now(),
  });
}

export function getJobState(jobId: string): OptimizeJobState | undefined {
  return jobs.get(jobId);
}

export function generateJobId(): string {
  return `opt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 11)}`;
}
