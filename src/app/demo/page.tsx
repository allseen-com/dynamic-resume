'use client';

import React, { useState } from 'react';
import Resume from '../../components/Resume';
import { ResumeData } from '../../types/resume';
import { 
  generateMarketingResume, 
  generateTechnicalResume, 
  generateDataAnalysisResume, 
  generateManagementResume 
} from '../../utils/resumeGenerator';
import resumeData from '../../../data/resume.json';

type ResumeType = 'default' | 'marketing' | 'technical' | 'data-analysis' | 'management';

export default function DemoPage() {
  const [currentType, setCurrentType] = useState<ResumeType>('default');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPDF = async (type: ResumeType) => {
    setIsGenerating(true);
    try {
      const url = type === 'default' ? '/api/generate-pdf' : `/api/generate-pdf?type=${type}`;
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Failed to generate PDF';
        alert(`PDF generation failed: ${errorMessage}`);
        return;
      }
      
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Meysam-Soheilipour-${type}-Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate the appropriate resume data and config
  const getResumeData = () => {
    const baseData = resumeData as ResumeData;
    
    switch (currentType) {
      case 'marketing':
        return generateMarketingResume(baseData);
      case 'technical':
        return generateTechnicalResume(baseData);
      case 'data-analysis':
        return generateDataAnalysisResume(baseData);
      case 'management':
        return generateManagementResume(baseData);
      default:
        return {
          resumeData: baseData,
          config: {
            titleBar: {
              main: "Performance Marketing / Marketing Data Analysis / Technical Project Manager",
              sub: "Business Development | Digital Marketing Strategy | Performance Optimizations"
            },
            sections: {
              showTechnicalProficiency: true,
              showCoreCompetencies: true,
              showProfessionalExperience: true,
              showEducation: true,
              showCertifications: true,
            }
          }
        };
    }
  };

  const { resumeData: currentResumeData, config } = getResumeData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Resume Demo</h1>
          <p className="mt-2 text-gray-600">
            Showcase different resume versions tailored for specific job types
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Resume Type Selector</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { key: 'default', label: 'Default Resume', desc: 'General purpose resume' },
              { key: 'marketing', label: 'Marketing Focus', desc: 'Emphasizes marketing and growth skills' },
              { key: 'technical', label: 'Technical Focus', desc: 'Highlights technical and development skills' },
              { key: 'data-analysis', label: 'Data Analysis', desc: 'Focuses on data analysis and BI skills' },
              { key: 'management', label: 'Management Focus', desc: 'Emphasizes leadership and management experience' },
            ].map((type) => (
              <button
                key={type.key}
                onClick={() => setCurrentType(type.key as ResumeType)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentType === type.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={type.desc}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleDownloadPDF(currentType)}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isGenerating ? '🔄 Generating...' : '📄 Download Current PDF'}
            </button>
            
            <button
              onClick={() => {
                ['default', 'marketing', 'technical', 'data-analysis', 'management'].forEach(async (type) => {
                  await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between downloads
                  handleDownloadPDF(type as ResumeType);
                });
              }}
              disabled={isGenerating}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                isGenerating
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              📦 Download All PDFs
            </button>
          </div>
        </div>

        {/* Current Resume Type Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            Current Resume Type: {currentType.charAt(0).toUpperCase() + currentType.slice(1).replace('-', ' ')}
          </h3>
          <p className="text-blue-800 text-sm">
            Title: {config.titleBar.main}
          </p>
          <p className="text-blue-800 text-sm">
            Subtitle: {config.titleBar.sub}
          </p>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
            <p className="text-sm text-gray-600">This is how the resume will appear</p>
          </div>
          
          <div className="p-6">
            <Resume
              resumeData={currentResumeData}
              config={config}
              showDownloadButton={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 