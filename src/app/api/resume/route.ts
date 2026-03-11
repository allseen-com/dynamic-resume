import { NextRequest, NextResponse } from 'next/server';
import { getResumeOverride, setResumeOverride } from '../../../lib/resumeStore';
import { normalizeResumeData } from '../../../lib/normalizeResumeData';
import type { ResumeData } from '../../../types/resume';
import defaultResumeData from '../../../../data/resume.json';

/**
 * GET /api/resume
 * Returns the current mother resume (in-memory override if set, else static data/resume.json).
 */
export async function GET() {
  const override = getResumeOverride();
  const data = override ?? normalizeResumeData(defaultResumeData as Record<string, unknown>);
  return NextResponse.json(data);
}

function isResumeData(obj: unknown): obj is ResumeData {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.header === 'object' &&
    typeof o.summary === 'object' &&
    Array.isArray(o.professionalExperience) &&
    typeof o.education === 'object' &&
    typeof o.certifications === 'object'
  );
}

/**
 * POST /api/resume
 * Saves the mother resume (in-memory). Optional: write to data/resume.json when ALLOW_RESUME_FILE_WRITE=1 (local dev).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!isResumeData(body)) {
      return NextResponse.json(
        { error: 'Invalid resume data: missing required fields (header, summary, professionalExperience, education, certifications)' },
        { status: 400 }
      );
    }
    setResumeOverride(body as ResumeData);

    if (process.env.ALLOW_RESUME_FILE_WRITE === '1') {
      try {
        const { writeFileSync, mkdirSync } = await import('fs');
        const { join } = await import('path');
        const dir = join(process.cwd(), 'data');
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'resume.json'), JSON.stringify(body, null, 2), 'utf-8');
      } catch (e) {
        console.warn('Could not write resume to file:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save resume failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Save failed' },
      { status: 500 }
    );
  }
}
