import React from 'react';
import { ResumeData, ResumeConfig, defaultResumeConfig } from '../types/resume';
import { pairItemsByLength } from '../utils/bulletUtils';

// Add this type override at the top of the file (after imports):
type FlexibleField = string | { value: string; fixed?: boolean; editable?: boolean };

type FlexibleResumeData = {
  header: {
    name: FlexibleField;
    address: FlexibleField;
    email: FlexibleField;
    phone: FlexibleField;
  };
  summary: FlexibleField;
  coreCompetencies: FlexibleField[] | { value: FlexibleField[] };
  technicalProficiency: {
    programming: FlexibleField[];
    cloudData: FlexibleField[];
    analytics: FlexibleField[];
    mlAi: FlexibleField[];
    productivity: FlexibleField[];
    marketingAds: FlexibleField[];
  };
  professionalExperience: {
    company: FlexibleField;
    title: FlexibleField;
    dateRange: FlexibleField;
    description: FlexibleField;
  }[];
  education: {
    school: FlexibleField;
    dateRange: FlexibleField;
    degree: FlexibleField;
  }[] | { value: {
    school: FlexibleField;
    dateRange: FlexibleField;
    degree: FlexibleField;
  }[] };
  certifications: FlexibleField[] | { value: FlexibleField[] };
};

interface ResumeProps {
  resumeData: FlexibleResumeData | ResumeData;
  config?: ResumeConfig;
  onDownloadPDF?: () => void;
  showDownloadButton?: boolean;
  isGenerating?: boolean;
  highlightSections?: string[];
}

// Utility function to get value from either string or { value, ... }
function getFieldValue(field: FlexibleField | string): string {
  if (typeof field === 'object' && field !== null && 'value' in field) {
    return field.value;
  }
  return field as string;
}

// Utility function to get array from either direct array or { value: array }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getArrayValue(field: FlexibleField[] | { value: FlexibleField[] } | { value: any[] }): any[] {
  if (Array.isArray(field)) {
    return field;
  }
  if (typeof field === 'object' && field !== null && 'value' in field && Array.isArray(field.value)) {
    return field.value;
  }
  return [];
}

// Utility function specifically for education arrays
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getEducationArray(field: any): any[] {
  if (Array.isArray(field)) {
    return field;
  }
  if (typeof field === 'object' && field !== null && 'value' in field && Array.isArray(field.value)) {
    return field.value;
  }
  return [];
}

// Convert ResumeData to FlexibleResumeData format
function convertToFlexibleResumeData(data: ResumeData | FlexibleResumeData): FlexibleResumeData {
  // If it's already in FlexibleResumeData format, return as is
  if ('header' in data && typeof data.header.name === 'string') {
    return data as FlexibleResumeData;
  }
  
  // Convert from ResumeData format
  const resumeData = data as ResumeData;
  return {
    header: {
      name: resumeData.header.name,
      address: resumeData.header.address,
      email: resumeData.header.email,
      phone: resumeData.header.phone,
    },
    summary: resumeData.summary,
    coreCompetencies: resumeData.coreCompetencies,
    technicalProficiency: resumeData.technicalProficiency,
    professionalExperience: resumeData.professionalExperience,
    education: resumeData.education,
    certifications: resumeData.certifications,
  } as FlexibleResumeData;
}

export default function Resume({ 
  resumeData: inputResumeData, 
  config = defaultResumeConfig, 
  onDownloadPDF,
  showDownloadButton = true,
  isGenerating = false,
  highlightSections = [],
}: ResumeProps) {
  // Convert the input data to FlexibleResumeData format
  const resumeData = convertToFlexibleResumeData(inputResumeData);

  // --- Core Competencies: Always 2 columns x 5 rows, no wrapping ---
  const coreCompetenciesArr = getArrayValue(resumeData.coreCompetencies);
  const coreItems = coreCompetenciesArr.slice(0, 10);
  while (coreItems.length < 10) coreItems.push('');
  const orderedCoreItems = pairItemsByLength(coreItems);

  // Get education and certifications arrays properly
  const educationArray = getEducationArray(resumeData.education);
  const certificationsArray = getArrayValue(resumeData.certifications);

  // Generate dynamic technical proficiency text
  const generateTechnicalProficiencyText = () => {
    const tech = resumeData.technicalProficiency;
    const allSkills = [
      ...tech.programming.map(getFieldValue),
      ...tech.cloudData.map(getFieldValue),
      ...tech.analytics.map(getFieldValue),
      ...tech.mlAi.map(getFieldValue),
      ...tech.productivity.map(getFieldValue),
      ...tech.marketingAds.map(getFieldValue)
    ];
    return allSkills.join(', ') + '.';
  };

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
      <main className="bg-white text-black font-sans max-w-3xl mx-auto p-7 shadow-lg print:shadow-none print:p-0 print:m-0 print:max-w-full text-[12px] leading-relaxed">
        {/* Header */}
        <header className="border-b-2 border-gray-800 pb-1.5 mb-3">
          <h1 className="text-[22px] font-bold text-center leading-tight mb-4 tracking-wide">
            {getFieldValue(resumeData.header.name)}
          </h1>
          <div className="text-center text-[12px] font-normal text-gray-700">
            <span>{getFieldValue(resumeData.header.address)}</span> |
            <span className="mx-1">{getFieldValue(resumeData.header.email)}</span> |
            <span>{getFieldValue(resumeData.header.phone)}</span>
          </div>
        </header>

        {/* Title Bar */}
        <div className="text-center mb-3.5 px-1">
          <div className="text-[14px] font-bold text-blue-900 leading-tight mb-0.5">
            {getFieldValue(config.titleBar.main)}
          </div>
          <div className="text-[12px] font-normal text-gray-700 leading-tight">
            {getFieldValue(config.titleBar.sub)}
          </div>
        </div>

        {/* Summary */}
        <section className={`mb-3.5${highlightSections.includes('summary') ? ' ring-2 ring-green-400 bg-green-50 transition-all duration-500' : ''}`}>
          <h2 className="section-header text-[16px]">Career Summary</h2>
          <p className="text-[12px] leading-relaxed text-justify">{getFieldValue(resumeData.summary)}</p>
        </section>

        {/* Core Competencies */}
        {config.sections.showCoreCompetencies && (
          <section className={`mb-3.5${highlightSections.includes('coreCompetencies') ? ' ring-2 ring-green-400 bg-green-50 transition-all duration-500' : ''}`}>
            <h2 className="section-header text-[16px]">Core Competencies</h2>
            <ul className="grid grid-cols-2 gap-x-6 text-[12px] ml-3">
              {orderedCoreItems.map((item: string, i: number) => (
                <li key={i} className="flex items-start mb-0.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                  <span className="leading-snug whitespace-nowrap overflow-hidden block" style={{maxWidth: '95%'}}>{getFieldValue(item)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Technical Proficiency - Now Dynamic */}
        {config.sections.showTechnicalProficiency && (
          <section className={`mb-5${highlightSections.includes('technicalProficiency') ? ' ring-2 ring-green-400 bg-green-50 transition-all duration-500' : ''}`}>
            <h2 className="section-header">Technical Proficiency</h2>
            <div className="text-base font-normal leading-relaxed">
              {generateTechnicalProficiencyText()}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {config.sections.showProfessionalExperience && (
          <section className={`mb-5${highlightSections.includes('professionalExperience') ? ' ring-2 ring-green-400 bg-green-50 transition-all duration-500' : ''}`}>
            <h2 className="section-header">Professional Experience</h2>
            {resumeData.professionalExperience.map((role, i) => {
              const hasDescription = getFieldValue(role.description) && getFieldValue(role.description).trim();
              return (
                <div key={i} className={`${hasDescription ? 'mb-4' : 'mb-2'}`}>
                  <div className="flex justify-between items-start mb-0.5">
                    <span className="text-xs font-bold underline underline-offset-1 flex-1">{getFieldValue(role.company)}</span>
                    <span className="text-xs font-bold text-gray-700 ml-2">{getFieldValue(role.dateRange)}</span>
                  </div>
                  <div className="font-bold text-xs text-blue-900 leading-tight mb-0.5">{getFieldValue(role.title)}</div>
                  {hasDescription && (
                    <div className="text-xs whitespace-pre-line leading-relaxed text-justify mt-1">
                      {getFieldValue(role.description)}
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* Education - Fixed to handle both array and object structures */}
        {config.sections.showEducation && (
          <section className="mb-5">
            <h2 className="section-header">Education</h2>
            {educationArray.map((edu: { school: string; dateRange: string; degree: string }, i: number) => (
              <div key={i} className="mb-1.5">
                <div className="flex justify-between items-start text-xs font-bold mb-0.5">
                  <span className="flex-1">{getFieldValue(edu.school)}</span>
                  <span className="text-gray-700 ml-2">{getFieldValue(edu.dateRange)}</span>
                </div>
                <div className="text-xs text-gray-700 leading-snug">{getFieldValue(edu.degree)}</div>
              </div>
            ))}
          </section>
        )}

        {/* Certifications - Fixed to handle both array and object structures */}
        {config.sections.showCertifications && (
          <section>
            <h2 className="section-header">Certifications</h2>
            <ul className="text-xs ml-3">
              {certificationsArray.map((cert: string, i: number) => (
                <li key={i} className="flex items-start mb-0.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 mr-1.5 flex-shrink-0"></span>
                  <span className="leading-snug">{getFieldValue(cert)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
} 