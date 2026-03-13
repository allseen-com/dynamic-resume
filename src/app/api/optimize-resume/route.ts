import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { ResumeData } from '../../../types/resume';
import { generateJobId, setJobPending } from '../../../lib/optimizeJobStore';
import { runOptimization } from './runOptimization';
import type { SectionPrompts } from '../../../utils/sectionPrompts';

/**
 * POST /api/optimize-resume
 * Returns 202 Accepted with jobId. Poll GET /api/optimize-resume/status?jobId=... for result.
 * Requires sectionPrompts (headline, summary, technical, experience, final), jobDescription, and resumeData.
 */
export interface PreAnalysisPayload {
  matchScore?: number;
  analysis?: string;
  strengths?: string[];
  gaps?: string[];
}

const SECTION_KEYS: (keyof SectionPrompts)[] = ['headline', 'summary', 'technical', 'experience', 'final'];

function validateSectionPrompts(obj: unknown): obj is SectionPrompts {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of SECTION_KEYS) {
    const v = (obj as Record<string, unknown>)[key];
    if (typeof v !== 'string' || !v.trim()) return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sectionPrompts,
      jobDescription,
      resumeData: rawResumeData,
      preAnalysis,
      targetPages,
    }: {
      sectionPrompts?: unknown;
      jobDescription: string;
      resumeData: ResumeData;
      preAnalysis?: PreAnalysisPayload;
      targetPages?: number;
    } = body;

    if (!validateSectionPrompts(sectionPrompts)) {
      return NextResponse.json(
        { error: 'Missing or invalid sectionPrompts. Required: headline, summary, technical, experience, final (each non-empty string).' },
        { status: 400 }
      );
    }
    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return NextResponse.json(
        { error: 'Missing or invalid jobDescription' },
        { status: 400 }
      );
    }
    if (!rawResumeData || typeof rawResumeData !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid resumeData' },
        { status: 400 }
      );
    }

    const jobId = generateJobId();
    setJobPending(jobId);

    after(() =>
      runOptimization({
        jobId,
        sectionPrompts,
        jobDescription,
        rawResumeData,
        preAnalysis,
        targetPages: typeof targetPages === 'number' && targetPages >= 1 && targetPages <= 5 ? targetPages : undefined,
      })
    );

    return NextResponse.json(
      { jobId },
      { status: 202 }
    );
  } catch (error) {
    console.error('Optimize-resume request failed:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Request failed',
      },
      { status: 500 }
    );
  }
}
