'use client';

import React, { useState, useEffect } from 'react';
import Resume from '../components/Resume';
import { ResumeData } from '../types/resume';
import resumeData from '../../data/resume.json';

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-pdf');
      
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
      a.download = 'Meysam-Soheilipour-Resume.pdf';
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

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-white p-8 shadow-lg">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Resume
      resumeData={resumeData as ResumeData}
      onDownloadPDF={handleDownloadPDF}
      isGenerating={isGenerating}
    />
  );
}
