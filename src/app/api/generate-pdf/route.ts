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
import { ensureFontsLoaded } from '../../../utils/fontManager';
import { handleError } from '../../../utils/errorHandler';

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const resumeType = searchParams.get('type') || 'default';
    
    // Initialize and verify fonts
    const fontResult = await ensureFontsLoaded();
    if (!fontResult.isValid) {
      console.error('Font initialization failed:', fontResult.errors);
      const appError = handleError.pdf(new Error(`Font verification failed: ${fontResult.missingFonts.join(', ')}`));
      return new NextResponse(
        JSON.stringify({ 
          error: appError.userMessage,
          details: fontResult.errors.join('; ')
        }), 
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(`Fonts verified (${fontResult.availableFonts.length} fonts loaded), generating ${resumeType} PDF...`);
    
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
    const { resumeData, config, template, jobDescription, filename } = await request.json();
    
    // Initialize and verify fonts
    const fontResult = await ensureFontsLoaded();
    if (!fontResult.isValid) {
      console.error('Font initialization failed:', fontResult.errors);
      const appError = handleError.pdf(new Error(`Font verification failed: ${fontResult.missingFonts.join(', ')}`));
      return new NextResponse(
        JSON.stringify({ 
          error: appError.userMessage,
          details: fontResult.errors.join('; ')
        }), 
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log(`Fonts verified (${fontResult.availableFonts.length} fonts loaded), generating template-aware PDF...`);
    
    // Generate appropriate config based on template if provided
    let finalConfig = config;
    if (template && !config) {
      // Convert template to ResumeConfig format
      finalConfig = {
        titleBar: {
          main: template.name,
          sub: template.description
        },
        sections: {
          showTechnicalProficiency: template.constraints.layout.showTechnicalProficiency ?? true,
          showCoreCompetencies: true,
          showProfessionalExperience: true,
          showEducation: true,
          showCertifications: true,
        }
      };
    }
    
    // Use provided filename or generate based on template
    let safeFilename = filename;
    if (!safeFilename) {
      if (template) {
        safeFilename = `Resume-${template.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
      } else if (jobDescription) {
        safeFilename = 'AI-Customized-Resume.pdf';
      } else {
        safeFilename = 'Custom-Resume.pdf';
      }
    }
    
    // Generate the PDF as a Node.js ReadableStream
    const pdfStream = await renderToStream(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      React.createElement(ResumeDocument, { 
        resumeData, 
        config: finalConfig || config
      }) as any
    );

    // Set headers for download
    const response = new NextResponse(pdfStream as unknown as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
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