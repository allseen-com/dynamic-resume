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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI-Powered Resume Customization
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Automatically adapt your resume to match any job description using AI. 
              Get ATS-friendly PDFs that highlight your most relevant skills and experience.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/apply"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                🤖 Customize with AI
              </a>
              <a
                href="/templates"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                📋 View Templates
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered Customization</h3>
            <p className="text-gray-600">
              Paste any job description and let AI adapt your resume to match the requirements perfectly.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">ATS-Friendly PDFs</h3>
            <p className="text-gray-600">
              Generate professional PDFs that pass through Applicant Tracking Systems with ease.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Real-time Preview</h3>
            <p className="text-gray-600">
              See your customized resume update instantly as you input job requirements.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">1</div>
              <h4 className="font-semibold mb-2">Paste Job Description</h4>
              <p className="text-sm text-gray-600">Copy and paste the job posting you&apos;re applying for</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">2</div>
              <h4 className="font-semibold mb-2">AI Analysis</h4>
              <p className="text-sm text-gray-600">Our AI analyzes requirements and matches your skills</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">3</div>
              <h4 className="font-semibold mb-2">Live Preview</h4>
              <p className="text-sm text-gray-600">See your customized resume update in real-time</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-sm font-bold">4</div>
              <h4 className="font-semibold mb-2">Download PDF</h4>
              <p className="text-sm text-gray-600">Get your tailored, ATS-friendly resume instantly</p>
            </div>
          </div>
        </div>

        {/* Default Resume Preview */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Default Resume Preview</h2>
            <p className="text-sm text-gray-600">This is your base resume before AI customization</p>
          </div>
          
          <div className="p-6">
            <Resume
              resumeData={resumeData as ResumeData}
              onDownloadPDF={handleDownloadPDF}
              showDownloadButton={true}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
