import React from 'react';
import resumeData from '../../data/resume.json';

// Types
interface ResumeData {
  header: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  summary: string;
  coreCompetencies: string[];
  technicalProficiency: {
    programming: string[];
    cloudData: string[];
    analytics: string[];
    mlAi: string[];
    productivity: string[];
    marketingAds: string[];
  };
  professionalExperience: {
    company: string;
    title: string;
    dateRange: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    dateRange: string;
    degree: string;
  }[];
  certifications: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tailorResumeForJD(_jobDescription: string): ResumeData {
  // TODO: Integrate AI endpoint
  return resumeData;
}

export default function Home() {
  // Placeholder for dynamic injection
  // const tailoredResume = tailorResumeForJD('');
  return (
    <main className="bg-white text-black font-sans max-w-3xl mx-auto my-8 p-8 shadow-lg print:shadow-none print:p-0 print:m-0 print:max-w-full">
      {/* Header */}
      <header className="border-b-4 border-gray-800 pb-2 mb-4">
        <h1 className="text-3xl font-bold text-center">{resumeData.header.name}</h1>
        <div className="text-center text-sm mt-1">
          <span>{resumeData.header.address}</span> |
          <span className="mx-1">{resumeData.header.email}</span> |
          <span>{resumeData.header.phone}</span>
        </div>
      </header>

      {/* Title Bar */}
      <div className="text-center font-semibold text-blue-900 text-lg mb-2">
        Growth & Product Leader / Performance Marketing Strategist / Business Developer<br />
        <span className="text-blue-700">Big Data & AI-Powered Solutions | Strategic Growth Planning | Leadership & Team Building</span>
      </div>

      {/* Summary */}
      <section className="mb-4">
        <h2 className="font-bold text-base border-b border-gray-300 pb-1 mb-1">Career Summary</h2>
        <p className="text-sm leading-relaxed">{resumeData.summary}</p>
      </section>

      {/* Core Competencies */}
      <section className="mb-4">
        <h2 className="font-bold text-base border-b border-gray-300 pb-1 mb-1">Core Competencies</h2>
        <ul className="grid grid-cols-2 gap-x-8 text-sm list-disc list-inside">
          {resumeData.coreCompetencies.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      {/* Technical Proficiency */}
      <section className="mb-4">
        <h2 className="font-bold text-base bg-gray-200 px-2 py-1 mb-1">Technical Proficiency</h2>
        <div className="text-sm">
          <span className="font-semibold">Programming:</span> {resumeData.technicalProficiency.programming.join(', ')}<br />
          <span className="font-semibold">Cloud/Data:</span> {resumeData.technicalProficiency.cloudData.join(', ')}<br />
          <span className="font-semibold">Analytics:</span> {resumeData.technicalProficiency.analytics.join(', ')}<br />
          <span className="font-semibold">ML/AI:</span> {resumeData.technicalProficiency.mlAi.join(', ')}<br />
          <span className="font-semibold">Productivity:</span> {resumeData.technicalProficiency.productivity.join(', ')}<br />
          <span className="font-semibold">Marketing/Ads:</span> {resumeData.technicalProficiency.marketingAds.join(', ')}
        </div>
      </section>

      {/* Professional Experience */}
      <section className="mb-4">
        <h2 className="font-bold text-base border-b border-gray-300 pb-1 mb-1">Professional Experience</h2>
        {resumeData.professionalExperience.map((role, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>{role.company}</span>
              <span>{role.dateRange}</span>
            </div>
            <div className="font-semibold text-sm">{role.title}</div>
            {role.bullets.length > 0 && (
              <ul className="list-disc list-inside text-sm ml-4 mt-1">
                {role.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-4">
        <h2 className="font-bold text-base bg-gray-200 px-2 py-1 mb-1">Advanced Education</h2>
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
        <h2 className="font-bold text-base bg-gray-200 px-2 py-1 mb-1">Specialized Training & Certifications</h2>
        <ul className="text-sm list-disc list-inside ml-4">
          {resumeData.certifications.map((cert, i) => (
            <li key={i}>{cert}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
