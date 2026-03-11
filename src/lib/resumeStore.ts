import type { ResumeData } from '../types/resume';

let override: ResumeData | null = null;

export function getResumeOverride(): ResumeData | null {
  return override;
}

export function setResumeOverride(data: ResumeData): void {
  override = data;
}

export function clearResumeOverride(): void {
  override = null;
}
