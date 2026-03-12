import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { ResumeData } from '../../../types/resume';
import { generateJobId, setJobPending } from '../../../lib/optimizeJobStore';
import { runOptimization } from './runOptimization';

/**
 * POST /api/optimize-resume
 * Returns 202 Accepted with jobId. Poll GET /api/optimize-resume/status?jobId=... for result.
 */
export interface PreAnalysisPayload {
  matchScore?: number;
  analysis?: string;
  strengths?: string[];
  gaps?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      jobDescription,
      resumeData: rawResumeData,
      preAnalysis,
    }: {
      prompt: string;
      jobDescription: string;
      resumeData: ResumeData;
      preAnalysis?: PreAnalysisPayload;
    } = await request.json();

    if (!prompt || !jobDescription || !rawResumeData) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, jobDescription, or resumeData' },
        { status: 400 }
      );
    }

    const jobId = generateJobId();
    setJobPending(jobId);

    after(() =>
      runOptimization({
        jobId,
        prompt,
        jobDescription,
        rawResumeData,
        preAnalysis,
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
