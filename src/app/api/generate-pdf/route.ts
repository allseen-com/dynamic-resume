import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import React from 'react';
import ResumeDocument from '../../../components/ResumeDocument';
import { ResumeData, ResumeConfig, defaultResumeConfig } from '../../../types/resume';
import baseResumeData from '../../../../data/resume.json';
import { 
  generateMarketingResume, 
  generateTechnicalResume, 
  generateDataAnalysisResume, 
  generateManagementResume 
} from '../../../utils/resumeGenerator';
import path from 'path';
import fs from 'fs';

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const resumeType = searchParams.get('type') || 'default';
    
    // Verify fonts exist before attempting to generate PDF
    const fontPath = path.resolve(process.cwd(), 'public', 'fonts');
    const requiredFonts = ['Lato-Regular.ttf', 'Lato-Bold.ttf', 'Lato-Italic.ttf'];
    
    for (const font of requiredFonts) {
      const fontFile = path.join(fontPath, font);
      if (!fs.existsSync(fontFile)) {
        console.error(`Font file not found: ${fontFile}`);
        return new NextResponse(
          JSON.stringify({ 
            error: 'Font files not found',
            details: `Missing font: ${font}`
          }), 
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    console.log(`Fonts verified, generating ${resumeType} PDF...`);
    
    // Generate appropriate resume based on type
    let resumeData: ResumeData;
    let config: ResumeConfig;
    let filename: string;
    
    switch (resumeType) {
      case 'marketing':
        ({ resumeData, config } = generateMarketingResume(baseResumeData));
        filename = 'Meysam-Soheilipour-Marketing-Resume.pdf';
        break;
      case 'technical':
        ({ resumeData, config } = generateTechnicalResume(baseResumeData));
        filename = 'Meysam-Soheilipour-Technical-Resume.pdf';
        break;
      case 'data-analysis':
        ({ resumeData, config } = generateDataAnalysisResume(baseResumeData));
        filename = 'Meysam-Soheilipour-DataAnalysis-Resume.pdf';
        break;
      case 'management':
        ({ resumeData, config } = generateManagementResume(baseResumeData));
        filename = 'Meysam-Soheilipour-Management-Resume.pdf';
        break;
      default:
        resumeData = baseResumeData;
        config = defaultResumeConfig;
        filename = 'Meysam-Soheilipour-Resume.pdf';
    }
    
    // Generate the PDF as a Node.js ReadableStream
    const pdfStream = await renderToStream(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(ResumeDocument, { resumeData, config }) as any
    );

    // Set headers for download
    const response = new NextResponse(pdfStream as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

    return response;
    
  } catch (error) {
    console.error('PDF generation error:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Parse custom resume data from POST body
    const { resumeData, config } = await request.json();
    
    // Verify fonts exist before attempting to generate PDF
    const fontPath = path.resolve(process.cwd(), 'public', 'fonts');
    const requiredFonts = ['Lato-Regular.ttf', 'Lato-Bold.ttf', 'Lato-Italic.ttf'];
    
    for (const font of requiredFonts) {
      const fontFile = path.join(fontPath, font);
      if (!fs.existsSync(fontFile)) {
        console.error(`Font file not found: ${fontFile}`);
        return new NextResponse(
          JSON.stringify({ 
            error: 'Font files not found',
            details: `Missing font: ${font}`
          }), 
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    console.log('Fonts verified, generating custom PDF...');
    
    // Generate the PDF as a Node.js ReadableStream
    const pdfStream = await renderToStream(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(ResumeDocument, { resumeData, config }) as any
    );

    // Set headers for download
    const response = new NextResponse(pdfStream as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Custom-Resume.pdf"',
        'Cache-Control': 'no-cache',
      },
    });

    return response;
    
  } catch (error) {
    console.error('PDF generation error:', error);
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 