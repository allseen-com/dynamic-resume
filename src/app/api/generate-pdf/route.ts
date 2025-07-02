import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.origin;
    
    // Configure browser with Vercel-specific optimizations
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process',
        '--disable-extensions'
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    
    // Set viewport and timeout
    await page.setViewport({ width: 1200, height: 800 });
    await page.setDefaultTimeout(30000); // 30 seconds timeout
    
    // Navigate to the page with a more reliable wait strategy
    await page.goto(`${url}`, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // Wait a bit for any dynamic content to load using setTimeout
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Hide the download button for PDF
    await page.addStyleTag({ 
      content: '.print\\:hidden { display: none !important; }' 
    });
    
    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
      preferCSSPageSize: false,
      displayHeaderFooter: false,
    });
    
    await browser.close();
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Meysam-Soheilipour-Resume.pdf"',
        'Cache-Control': 'no-cache',
      },
    });
    
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