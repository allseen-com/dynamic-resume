import { NextRequest, NextResponse } from 'next/server';
import { getJobState } from '../../../../lib/optimizeJobStore';

/**
 * GET /api/optimize-resume/status?jobId=...
 * Poll this after receiving 202 from POST /api/optimize-resume.
 */
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json(
      { error: 'Missing jobId query parameter' },
      { status: 400 }
    );
  }

  const state = getJobState(jobId);
  if (!state) {
    return NextResponse.json(
      { error: 'Job not found', status: 'not_found' },
      { status: 404 }
    );
  }

  if (state.status === 'pending') {
    return NextResponse.json({
      status: 'pending',
      ...(state.statusMessage && { statusMessage: state.statusMessage }),
    });
  }

  if (state.status === 'failed') {
    return NextResponse.json({
      status: 'failed',
      error: state.error,
    });
  }

  return NextResponse.json({
    status: 'completed',
    result: state.result,
  });
}
