import React from 'react';
import { ResumeData, ResumeConfig, defaultResumeConfig } from '../types/resume';

interface ResumeProps {
  resumeData: ResumeData;
  config?: ResumeConfig;
  onDownloadPDF?: () => void;
  showDownloadButton?: boolean;
  isGenerating?: boolean;
}

export default function Resume({ 
  resumeData, 
  config = defaultResumeConfig, 
  onDownloadPDF,
  showDownloadButton = true,
  isGenerating = false
}: ResumeProps) {
  // --- Core Competencies: Always 2 columns x 5 rows, no wrapping ---
  const coreItems = resumeData.coreCompetencies.value.slice(0, 10);
  while (coreItems.length < 10) coreItems.push('');
  const rows = Array.from({ length: 5 }, (_, i) => [coreItems[i], coreItems[i + 5]]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Download Button */}
      {showDownloadButton && onDownloadPDF && (
        <div className="max-w-3xl mx-auto mb-4 px-8">
          <button
            onClick={onDownloadPDF}
            disabled={isGenerating}
            className={`font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 print:hidden ${
              isGenerating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isGenerating ? '🔄 Generating PDF...' : '📄 Download PDF'}
          </button>
        </div>
      )}

      {/* Resume Content */}
      <main className="bg-white text-black font-sans max-w-3xl mx-auto p-7 shadow-lg print:shadow-none print:p-0 print:m-0 print:max-w-full text-sm leading-relaxed">
        {/* Header */}
        <header className="border-b-2 border-gray-800 pb-2 mb-5">
          <h1 className="text-4xl font-extrabold text-center leading-tight mb-5 tracking-wide">
            {resumeData.header.name}
          </h1>
          <div className="text-center text-base font-medium text-gray-700">
            <span>{resumeData.header.address}</span> |
            <span> {resumeData.header.email} </span>|
            <span> {resumeData.header.phone}</span>
          </div>
        </header>

        {/* Title Bar */}
        <div className="text-center mb-5 px-1">
          <div className="text-lg font-bold text-blue-900 leading-tight mb-1">
            {config.titleBar.main}
          </div>
          <div className="text-base font-normal text-gray-700 leading-tight">
            {config.titleBar.sub}
          </div>
        </div>

        {/* Summary */}
        <section className="mb-5">
          <h2 className="section-header">Career Summary</h2>
          <p className="text-base leading-relaxed text-justify">{resumeData.summary.value}</p>
        </section>

        {/* Core Competencies */}
        {config.sections.showCoreCompetencies && (
          <section className="mb-5">
            <h2 className="section-header">Core Competencies</h2>
            <ul className="space-y-1.5 ml-3">
              {rows.map(([left, right], i) => (
                <li key={i} className="flex flex-row flex-wrap gap-x-6">
                  {left && (
                    <span className="flex items-start flex-1 min-w-[180px] max-w-full whitespace-nowrap">
                      <span className="w-2 h-2 bg-black rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span className="leading-snug">{left}</span>
                    </span>
                  )}
                  {right && (
                    <span className="flex items-start flex-1 min-w-[180px] max-w-full whitespace-nowrap ml-4">
                      <span className="w-2 h-2 bg-black rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      <span className="leading-snug">{right}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Technical Proficiency */}
        {config.sections.showTechnicalProficiency && (
          <section className="mb-5">
            <h2 className="section-header">Technical Proficiency</h2>
            {/* Use normal font, comma separator, not bold */}
            <div className="text-base font-normal leading-relaxed">
              {`SQL, MySQL Database, AWS, Looker Data Studio, AI Automation, Google Tag Manager, PHP, HTML, CSS, WordPress Development, Google Search Console, Google Analytics, Adobe Analytics, Google AdWords, Google Optimize, A/B Testing, Similar Web, Zapier, HubSpot, Adobe CC.`}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {config.sections.showProfessionalExperience && (
          <section className="mb-5">
            <h2 className="section-header">Professional Experience</h2>
            {resumeData.professionalExperience.map((role, i) => {
              const hasDescription = role.description.value && role.description.value.trim();
              return (
                <div key={i} className={`${hasDescription ? 'mb-6' : 'mb-3'}`}>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-base font-bold underline underline-offset-1 flex-1">{role.company}</span>
                    <span className="text-base font-bold text-gray-700 ml-2">{role.dateRange}</span>
                  </div>
                  <div className="font-bold text-base text-blue-900 leading-tight mb-1">{role.title}</div>
                  {hasDescription && (
                    <div className="text-base whitespace-pre-line leading-relaxed text-justify mt-1">
                      {role.description.value}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Education */}
        {config.sections.showEducation && (
          <section className="mb-5">
            <h2 className="section-header">Education</h2>
            {resumeData.education.value.map((edu, i) => (
              <div key={i} className="mb-2.5">
                <div className="flex justify-between items-start text-base font-bold mb-1.5">
                  <span className="flex-1">{edu.school}</span>
                  <span className="text-gray-700 ml-2">{edu.dateRange}</span>
                </div>
                <div className="text-base text-gray-700 leading-snug">{edu.degree}</div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {config.sections.showCertifications && (
          <section>
            <h2 className="section-header">Certifications</h2>
            <ul className="text-base ml-3">
              {resumeData.certifications.value.map((cert, i) => (
                <li key={i} className="flex items-start mb-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  <span className="leading-snug">{cert}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
} 