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
      <main className="bg-white text-black font-sans max-w-3xl mx-auto p-7 shadow-lg print:shadow-none print:p-0 print:m-0 print:max-w-full text-xs leading-relaxed">
        {/* Header */}
        <header className="border-b-2 border-gray-800 pb-1.5 mb-3">
          <h1 className="text-2xl font-bold text-center leading-tight mb-4 tracking-wide">
            {resumeData.header.name}
          </h1>
          <div className="text-center text-xs font-normal text-gray-700">
            <span>{resumeData.header.address}</span> |
            <span className="mx-1">{resumeData.header.email}</span> |
            <span>{resumeData.header.phone}</span>
          </div>
        </header>

        {/* Title Bar */}
        <div className="text-center mb-3.5 px-1">
          <div className="text-sm font-bold text-blue-900 leading-tight mb-0.5">
            {config.titleBar.main}
          </div>
          <div className="text-xs font-normal text-gray-700 leading-tight">
            {config.titleBar.sub}
          </div>
        </div>

        {/* Summary */}
        <section className="mb-3.5">
          <h2 className="section-header">Career Summary</h2>
          <p className="text-xs leading-relaxed text-justify">{resumeData.summary}</p>
        </section>

        {/* Core Competencies */}
        {config.sections.showCoreCompetencies && (
          <section className="mb-3.5">
            <h2 className="section-header">Core Competencies</h2>
            <ul className="grid grid-cols-2 gap-x-6 text-xs ml-3">
              {resumeData.coreCompetencies.map((item, i) => (
                <li key={i} className="flex items-start mb-0.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                  <span className="leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Technical Proficiency */}
        {config.sections.showTechnicalProficiency && (
          <section className="mb-3.5">
            <h2 className="section-header">Technical Proficiency</h2>
            <div className="text-xs font-bold leading-relaxed">
              SQL; MySQL Database; AWS; Looker Data Studio; AI Automation, Google Tag Manager; PHP; HTML; CSS; WordPress Development; Google Search Console; Google Analytics; Adobe Analytics; Google AdWords; Google Optimize; A/B Testing; Similar Web; Zapier; HubSpot; Adobe CC.
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {config.sections.showProfessionalExperience && (
          <section className="mb-3.5">
            <h2 className="section-header">Professional Experience</h2>
            {resumeData.professionalExperience.map((role, i) => {
              const hasDescription = role.description && role.description.trim();
              return (
                <div key={i} className={`${hasDescription ? 'mb-4' : 'mb-2'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-xs font-bold underline underline-offset-1 flex-1">{role.company}</span>
                    <span className="text-xs font-bold text-gray-700 ml-2">{role.dateRange}</span>
                  </div>
                  <div className="font-bold text-xs text-blue-900 leading-tight mb-0.5">{role.title}</div>
                  {hasDescription && (
                    <div className="text-xs whitespace-pre-line leading-relaxed text-justify mt-1">
                      {role.description}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Education */}
        {config.sections.showEducation && (
          <section className="mb-3.5">
            <h2 className="section-header">Education</h2>
            {resumeData.education.map((edu, i) => (
              <div key={i} className="mb-1.5">
                <div className="flex justify-between items-start text-xs font-bold mb-0.5">
                  <span className="flex-1">{edu.school}</span>
                  <span className="text-gray-700 ml-2">{edu.dateRange}</span>
                </div>
                <div className="text-xs text-gray-700 leading-snug">{edu.degree}</div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {config.sections.showCertifications && (
          <section>
            <h2 className="section-header">Certifications</h2>
            <ul className="text-xs ml-3">
              {resumeData.certifications.map((cert, i) => (
                <li key={i} className="flex items-start mb-0.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
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