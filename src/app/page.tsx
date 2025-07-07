'use client';

import React, { useState, useEffect } from 'react';
import Resume from '../components/Resume';
import { ResumeData, ResumeConfig } from '../types/resume';
import resumeData from '../../data/resume.json';

type ResumeArchiveItem = {
  label: string;
  data: ResumeData;
  config: ResumeConfig;
  isCurrent: boolean;
  date: string;
};

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const archive: ResumeArchiveItem[] = JSON.parse(localStorage.getItem('resumeArchive') || '[]');
      const current = archive.find((item) => item.isCurrent);
      setCurrentResume(current ? current.data : null);
    }
  }, []);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: currentResume || resumeData }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || 'Failed to generate PDF';
        alert(`PDF generation failed: ${errorMessage}`);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Live-Resume.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isClient) {
    return <div className="min-h-screen bg-gray-100" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : ''}`}
            >
              {isGenerating ? '🔄 Generating...' : '📄 Download PDF'}
            </button>
            <a
              href="/customize"
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-green-600 hover:bg-green-700 text-white text-center"
            >
              🤖 Customize with AI
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Resume
          resumeData={currentResume || resumeData}
          showDownloadButton={false}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
}
