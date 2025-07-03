import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

async function getBrowser() {
  return puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

export async function GET() {
  try {
    // Debug: log working directory and __dirname
    console.log('process.cwd():', process.cwd());
    console.log('__dirname:', __dirname);
    console.log('chromium.executablePath():', await chromium.executablePath());
    console.log('chromium.args:', chromium.args);

    // Extract just the resume content (main element)
    const resumeHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Meysam Soheilipour - Resume</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', Arial, sans-serif;
              line-height: 1.6;
              color: #000;
              background: white;
            }
            
            .resume-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              background: white;
            }
            
            .header {
              border-bottom: 4px solid #1e3a8a;
              padding-bottom: 16px;
              margin-bottom: 16px;
              text-align: center;
            }
            
            .header h1 {
              font-size: 48px;
              font-weight: 800;
              margin-bottom: 4px;
              color: #000;
            }
            
            .header .contact-info {
              font-size: 16px;
              font-weight: 500;
            }
            
            .title-bar {
              text-align: center;
              font-weight: 700;
              color: #1e3a8a;
              font-size: 24px;
              margin-bottom: 8px;
            }
            
            .title-bar .subtitle {
              font-size: 16px;
              font-weight: 600;
              color: #000;
            }
            
            .section {
              margin-bottom: 16px;
            }
            
            .section-header {
              font-size: 16px;
              font-weight: 700;
              background-color: #1e3a8a;
              color: white;
              padding: 4px 8px;
              margin-bottom: 4px;
              border-radius: 2px;
            }
            
            .section-content {
              font-size: 14px;
              line-height: 1.5;
            }
            
            .competencies-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px 32px;
              margin-left: 20px;
            }
            
            .competencies-grid li {
              list-style-type: disc;
            }
            
            .experience-item {
              margin-bottom: 24px;
            }
            
            .experience-header {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              font-weight: 600;
              align-items: flex-end;
            }
            
            .experience-title {
              font-weight: 700;
              font-size: 16px;
              margin: 2px 0 4px 0;
            }
            
            .experience-description {
              font-size: 14px;
              line-height: 1.5;
              white-space: pre-line;
              margin-top: 8px;
            }
            
            .education-item {
              margin-bottom: 8px;
            }
            
            .education-header {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              font-weight: 600;
            }
            
            .certifications-list {
              margin-left: 20px;
            }
            
            .certifications-list li {
              list-style-type: disc;
            }
            
            @media print {
              body {
                background: white !important;
                color: black !important;
              }
              
              .resume-container {
                box-shadow: none !important;
                margin: 0 !important;
                padding: 0 !important;
                max-width: 100% !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="resume-container">
            <!-- Header -->
            <header class="header">
              <h1>Meysam Soheilipour</h1>
              <div class="contact-info">
                <span>180 Brannan Street, #320, San Francisco, CA, 94107</span> |
                <span style="margin: 0 4px;">Soheil_dot@yahoo.com</span> |
                <span>(971) 267-9430</span>
              </div>
            </header>

            <!-- Title Bar -->
            <div class="title-bar">
              Performance Marketing / Marketing Data Analysis / Technical Project Manager<br />
              <span class="subtitle">Business Development | Digital Marketing Strategy | Performance Optimizations</span>
            </div>

            <!-- Summary -->
            <section class="section">
              <h2 class="section-header">Career Summary</h2>
              <div class="section-content">
                Growth marketing and product management executive with 10+ years of experience driving digital transformation and revenue growth across travel tech, media, and e-commerce. Adept at comprehensive market analysis, developing data-driven strategies, and leveraging AI automation, Python coding, and financial modeling to optimize performance, scale operations, and foster cross-functional collaboration. Proven track record in managing high-performance teams and executing innovative digital campaigns—from SEO/SEM to product-led growth initiatives—that consistently deliver measurable results. Analytical, data-driven, and solutions-focused leader with hybrid skill sets, passionate about integrating emerging technologies with business development strategies to enhance customer engagement and market competitiveness in remote, global environments.
              </div>
            </section>

            <!-- Core Competencies -->
            <section class="section">
              <h2 class="section-header">Core Competencies</h2>
              <ul class="competencies-grid">
                <li>Growth Marketing Strategy & Digital Acquisition</li>
                <li>Market Analysis & Financial Modeling</li>
                <li>eCommerce & Brand Management</li>
                <li>Performance Optimization & ROI Improvement</li>
                <li>Product Management & Product-Led Growth</li>
                <li>Leadership & Project Management</li>
                <li>Cross-Functional Collaboration</li>
                <li>AI & Automation Integration</li>
                <li>Online Business Development</li>
                <li>Technical Project Management & Strategies</li>
              </ul>
            </section>

            <!-- Technical Proficiency -->
            <section class="section">
              <h2 class="section-header">Technical Proficiency</h2>
              <div class="section-content">
                <span style="font-weight: 600;">
                  SQL; MySQL Database; AWS; Looker Data Studio; AI Automation, Google Tag Manager; PHP; HTML; CSS; WordPress Development; Google Search Console; Google Analytics; Adobe Analytics; Google AdWords; Google Optimize; A/B Testing; Similar Web; Zapier; HubSpot; Adobe CC.
                </span>
              </div>
            </section>

            <!-- Professional Experience -->
            <section class="section">
              <h2 class="section-header">Professional Experience</h2>
              <div class="experience-item">
                <div class="experience-header">
                  <span style="text-decoration: underline; text-underline-offset: 2px;">Red Ventures (San Francisco, CA)</span>
                  <span>12/2021 – Present</span>
                </div>
                <div class="experience-title">Sr. Growth Marketing – Audience and SEO</div>
                <div class="experience-description">
                  Responsible for the CNET brand in the 'Media & Commerce' vertical at Red Ventures to diversify the audience and contribute to the audience acquisition and revenue growth strategies through many different channels on Google, YouTube, Amazon, and CNET.com platforms.

                  Successfully plugged-in to many different teams (Leadership, Engineering, Data, CE, SEO, Product, Editorial, Video, and Commerce) to manage cross functional optimization of the workflows, Implement the best practices, and providing a data-driven growth strategy for CNET in different business units (Amazon Publishing, Video Optimizations, SEO, Customer Experience)

                  Managing data pipe-lines from various sources, determining data needs & sources, developing SQL Queries, and analyze big data, to discover insights, define and align KPIs, and find growth opportunities.

                  Building real time dashboards, in-depth monitoring, analysis, and tracking KPIs through the sales funnel, to optimize step-by-step performance, and improve overall ROI for many on-site and off-site channels.

                  Contributing to the video content strategy by providing data-driven content ideas, optimization of the workflows and processes, and revenue generating best practices that results to the general growth of the YouTube, Social, and on-site channels. Insightfully contributed to the production of video series that moved many all-time records across the CNET channels, improved and diversified audience, and added new commerce-based revenue sources, resulted in a 2X impact in the affiliate revenue, and 4X impact on the Ad revenue.

                  Proactively contributed to the CNET SEO strategy to beat the traffic and revenue goals by managing the editorial and technical resources, prioritizing the highest revenue opportunities, expanding into the new topics, collaborating with the video team to make video content and implement the best practices for the video content, and contribute to the SEO playbook.

                  Actively managing day-to-day operations of Amazon on-site Publishing program and collaborate with editorial and technical teams to improve the content strategy, and profitability, resulting in a 5X sustainable growth in the first 6 months.
                </div>
              </div>
              
              <div class="experience-item">
                <div class="experience-header">
                  <span style="text-decoration: underline; text-underline-offset: 2px;">Lam Research (Oregon, USA)</span>
                  <span>01/2015 – 09/2016</span>
                </div>
                <div class="experience-title">QA / Testing Technician</div>
              </div>
              
              <div class="experience-item">
                <div class="experience-header">
                  <span style="text-decoration: underline; text-underline-offset: 2px;">Nilgasht Travel Agency (Tehran, Iran)</span>
                  <span>01/2015 – 09/2016</span>
                </div>
                <div class="experience-title">Digital Marketing Manager / CRM Project Manager</div>
              </div>
              
              <div class="experience-item">
                <div class="experience-header">
                  <span style="text-decoration: underline; text-underline-offset: 2px;">Hamrah Ltd, (London, UK)</span>
                  <span>04/2013 – 02/2016</span>
                </div>
                <div class="experience-title">Jr. Digital Marketer / SEO Specialist / Copywriter</div>
              </div>
            </section>

            <!-- Education -->
            <section class="section">
              <h2 class="section-header">Education</h2>
              <div class="education-item">
                <div class="education-header">
                  <span>Tehran University (Tehran, Iran)</span>
                  <span>09/2013 – 11/2015</span>
                </div>
                <div class="section-content">Master of Business Management; Minor in Marketing</div>
              </div>
              <div class="education-item">
                <div class="education-header">
                  <span>Shahrekord University (Shahrekord, Iran)</span>
                  <span>09/2006 – 07/2010</span>
                </div>
                <div class="section-content">Bachelor of Science, Mechanical Engineering</div>
              </div>
            </section>

            <!-- Certifications -->
            <section class="section">
              <h2 class="section-header">Certifications</h2>
              <ul class="certifications-list">
                <li>Google Analytics Certification, 07/2017</li>
                <li>Google Tag Manager Certification, 07/2017</li>
                <li>Google Search Certification, 07/2017</li>
              </ul>
            </section>
          </div>
        </body>
      </html>
    `;

    // Launch browser and generate PDF
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    // Set viewport and timeout
    await page.setViewport({ width: 1200, height: 800 });
    await page.setDefaultTimeout(30000);
    
    // Set the HTML content
    await page.setContent(resumeHtml, { waitUntil: 'networkidle0' });
    
    // Generate PDF with optimized settings for ATS compatibility
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