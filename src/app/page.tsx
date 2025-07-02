'use client';

import React from 'react';
import resumeData from '../../data/resume.json';

export default function Home() {
  const handleDownloadPDF = async () => {
    const res = await fetch('/api/generate-pdf');
    if (!res.ok) {
      alert('Failed to generate PDF.');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Meysam-Soheilipour-Resume.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Download Button */}
      <div className="max-w-3xl mx-auto mb-4 px-8">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-200 print:hidden"
        >
          📄 Download PDF
        </button>
      </div>

      {/* Resume Content */}
      <main className="bg-white text-black font-sans max-w-3xl mx-auto p-8 shadow-lg print:shadow-none print:p-0 print:m-0 print:max-w-full">
        {/* Header */}
        <header className="border-b-4 border-gray-800 pb-2 mb-4">
          <h1 className="text-4xl font-extrabold text-center leading-tight mb-1">{resumeData.header.name}</h1>
          <div className="text-center text-base mt-1 font-medium">
            <span>{resumeData.header.address}</span> |
            <span className="mx-1">{resumeData.header.email}</span> |
            <span>{resumeData.header.phone}</span>
          </div>
        </header>

        {/* Title Bar */}
        <div className="text-center font-bold text-blue-900 text-xl mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
          Performance Marketing / Marketing Data Analysis / Technical Project Manager<br />
          <span className="text-base font-semibold text-black">Business Development | Digital Marketing Strategy | Performance Optimizations</span>
        </div>

        {/* Summary */}
        <section className="mb-4">
          <h2 className="section-header">Career Summary</h2>
          <p className="text-sm leading-relaxed">{resumeData.summary}</p>
        </section>

        {/* Core Competencies */}
        <section className="mb-4">
          <h2 className="section-header">Core Competencies</h2>
          <ul className="grid grid-cols-2 gap-x-8 text-sm list-disc list-inside">
            {resumeData.coreCompetencies.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>

        {/* Technical Proficiency */}
        <section className="mb-4">
          <h2 className="section-header">Technical Proficiency</h2>
          <div className="text-sm">
            <span className="font-semibold">SQL; MySQL Database; AWS; Looker Data Studio; AI Automation, Google Tag Manager; PHP; HTML; CSS; WordPress Development; Google Search Console; Google Analytics; Adobe Analytics; Google AdWords; Google Optimize; A/B Testing; Similar Web; Zapier; HubSpot; Adobe CC.</span>
          </div>
        </section>

        {/* Professional Experience */}
        <section className="mb-4">
          <h2 className="section-header">Professional Experience</h2>
          {resumeData.professionalExperience.map((role, i) => (
            <div key={i} className="mb-6">
              <div className="flex justify-between text-sm font-semibold items-end">
                <span className="underline underline-offset-2">{role.company}</span>
                <span>{role.dateRange}</span>
              </div>
              <div className="font-bold text-base mt-0.5 mb-1">{role.title}</div>
              {role.description && (
                <div className="text-sm whitespace-pre-line leading-relaxed space-y-2 mt-2">
                  {role.description}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Education */}
        <section className="mb-4">
          <h2 className="section-header">Advanced Education</h2>
          <ul className="text-sm">
            {resumeData.education.map((edu, i) => (
              <li key={i} className="mb-1">
                <span className="font-semibold">{edu.school}</span>, {edu.dateRange}<br />
                {edu.degree}
              </li>
            ))}
          </ul>
        </section>

        {/* Certifications */}
        <section className="mb-4">
          <h2 className="section-header">Specialized Training & Certifications</h2>
          <ul className="text-sm list-disc list-inside ml-4">
            {resumeData.certifications.map((cert, i) => (
              <li key={i}>{cert}</li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
