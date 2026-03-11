import type { ResumeData } from '../types/resume';

/**
 * Raw resume JSON (e.g. from data/resume.json) may have technicalProficiency
 * with a _dynamic boolean. ResumeData expects Record<string, string[]>.
 * This strips _dynamic so the result is valid ResumeData.
 */
export function normalizeResumeData(data: Record<string, unknown>): ResumeData {
  const d = { ...data } as unknown as ResumeData;
  const tp = d.technicalProficiency as Record<string, unknown> | undefined;
  if (tp && typeof tp === 'object' && '_dynamic' in tp) {
    const rest = { ...tp };
    delete rest._dynamic;
    d.technicalProficiency = rest as Record<string, string[]>;
  }
  return d;
}
