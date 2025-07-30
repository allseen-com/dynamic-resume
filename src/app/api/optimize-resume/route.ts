import { NextRequest, NextResponse } from 'next/server';
import { createAIService } from '../../../services/aiService';
import { ResumeData } from '../../../types/resume';

export async function POST(request: NextRequest) {
  try {
    const { prompt, jobDescription, resumeData }: {
      prompt: string;
      jobDescription: string;
      resumeData: ResumeData;
    } = await request.json();

    if (!prompt || !jobDescription || !resumeData) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, jobDescription, or resumeData' },
        { status: 400 }
      );
    }

    // Create AI service on server side where env vars are available
    const aiService = createAIService();
    
    // Optimize resume using AI service
    const optimizedData = await aiService.customizeResume(jobDescription, resumeData, prompt);

    return NextResponse.json({ 
      success: true, 
      data: optimizedData 
    });

  } catch (error) {
    console.error('AI optimization failed:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Optimization failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}