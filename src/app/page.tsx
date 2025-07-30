"use client";

import React, { useState, useEffect } from "react";
import Resume from "../components/Resume";
import { ResumeData } from "../types/resume";
import { ResumeTemplate, RESUME_TEMPLATES, getTemplateById, analyzeContentFit } from "../types/template";
import { generateTemplateAwarePrompt, createFinalPrompt, preprocessResumeForTemplate } from "../utils/templateAwarePrompts";
import { callAIService } from "../utils/aiResumeGenerator";
import LoadingSpinner from "../components/LoadingSpinner";
import motherResumeData from "../../data/resume.json";

type ResumeArchiveItem = {
  id: string;
  label: string;
  data: ResumeData;
  template: ResumeTemplate;
  jobDescription: string;
  createdAt: string;
};

export default function Home() {
  // Core state
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(RESUME_TEMPLATES[0].id);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<ResumeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Archive state
  const [archive, setArchive] = useState<ResumeArchiveItem[]>([]);
  const [archiveLabel, setArchiveLabel] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Client-side only
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load archive from localStorage
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("resumeArchive") || "[]");
      setArchive(stored);
    }
  }, []);

  const selectedTemplate = getTemplateById(selectedTemplateId);
  const motherResume = motherResumeData as ResumeData;
  
  // Analyze content fit with selected template
  const contentAnalysis = analyzeContentFit(motherResume, selectedTemplate);

  // Handle AI optimization
  const handleOptimize = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    setIsOptimizing(true);
    setError(null);

    try {
      // Preprocess mother resume to fit template constraints
      const preprocessedResume = preprocessResumeForTemplate(motherResume, selectedTemplate);
      
      // Generate template-aware prompt
      const basePrompt = generateTemplateAwarePrompt({
        template: selectedTemplate,
        jobDescription,
        baseResumeData: preprocessedResume
      });
      
      const finalPrompt = createFinalPrompt(basePrompt, jobDescription, preprocessedResume);
      
      // Call AI service
      const optimizedData = await callAIService(finalPrompt, jobDescription, preprocessedResume);
      
      setOptimizedResume(optimizedData);
      setShowSuccess(true);
      
      // Auto-generate archive label
      const company = extractCompanyFromJobDescription(jobDescription);
      setArchiveLabel(company ? `${company} - ${selectedTemplate.name}` : selectedTemplate.name);
      
    } catch (err) {
      console.error('Optimization failed:', err);
      setError(err instanceof Error ? err.message : 'Optimization failed');
    } finally {
      setIsOptimizing(false);
    }
  };

  // Save to archive
  const saveToArchive = () => {
    if (!optimizedResume || !archiveLabel.trim()) {
      setError("Please enter a label for this optimized resume");
      return;
    }

    const newItem: ResumeArchiveItem = {
      id: Date.now().toString(),
      label: archiveLabel,
      data: optimizedResume,
      template: selectedTemplate,
      jobDescription,
      createdAt: new Date().toISOString(),
    };

    const newArchive = [newItem, ...archive];
    setArchive(newArchive);
    localStorage.setItem("resumeArchive", JSON.stringify(newArchive));
    setArchiveLabel("");
    setError(null);
    setShowSuccess(true);
  };

  // Download PDF
  const handleDownloadPDF = async (resumeToDownload = optimizedResume || motherResume, label = archiveLabel || 'Resume') => {
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          resumeData: resumeToDownload,
          template: selectedTemplate,
          filename: `${label}.pdf`
        }),
      });
      
      if (!res.ok) throw new Error('PDF generation failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${label}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to generate PDF');
    }
  };

  // Load from archive
  const loadFromArchive = (item: ResumeArchiveItem) => {
    setOptimizedResume(item.data);
    setSelectedTemplateId(item.template.id);
    setJobDescription(item.jobDescription);
    setArchiveLabel(item.label);
  };

  if (!isClient) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg">
          Resume optimized successfully!
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            
            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Job Description</h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                rows={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-500"
              />
            </div>

            {/* Template Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Select Template</h2>
              <div className="space-y-3">
                {RESUME_TEMPLATES.map((template) => (
                  <label key={template.id} className="flex items-start space-x-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="template"
                      value={template.id}
                      checked={selectedTemplateId === template.id}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900 group-hover:text-indigo-700">{template.name}</div>
                      <div className="text-sm text-slate-600">{template.description}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Max {template.constraints.maxPages} pages • 
                        Summary: {template.constraints.wordLimits.summary}w • 
                        Experience: {template.constraints.wordLimits.experiencePerJob}w per job
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              {/* Content Analysis */}
              {!contentAnalysis.fits && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm font-medium text-amber-800">Template Adjustments Needed:</div>
                  <ul className="text-xs text-amber-700 mt-1 space-y-1">
                    {contentAnalysis.violations.map((violation, i) => (
                      <li key={i}>• {violation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Optimize Button */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">3. AI Optimization</h2>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing || !jobDescription.trim()}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  isOptimizing || !jobDescription.trim()
                    ? "bg-slate-400 cursor-not-allowed text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {isOptimizing ? (
                  <div className="flex items-center justify-center">
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Optimizing with AI...</span>
                  </div>
                ) : (
                  "🤖 Optimize Resume"
                )}
              </button>
              
              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}
            </div>

            {/* Archive Controls */}
            {optimizedResume && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Save & Download</h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={archiveLabel}
                    onChange={(e) => setArchiveLabel(e.target.value)}
                    placeholder="Label this version (e.g., 'Google - Technical Role')"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-500"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={saveToArchive}
                      className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                    >
                      💾 Save to Archive
                    </button>
                    <button
                      onClick={() => handleDownloadPDF()}
                      className="flex-1 py-2 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors"
                    >
                      📄 Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions for Mother Resume */}
            {!optimizedResume && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <button
                  onClick={() => handleDownloadPDF(motherResume, 'Mother-Resume')}
                  className="w-full py-2 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors"
                >
                  📄 Download Mother Resume
                </button>
              </div>
            )}

            {/* Archive List */}
            {archive.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Versions ({archive.length})</h2>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {archive.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-slate-900">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.template.name} • {new Date(item.createdAt).toLocaleDateString()}</div>
                      </div>
                      <button
                        onClick={() => loadFromArchive(item)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Load
                      </button>
                    </div>
                  ))}
                </div>
                {archive.length > 5 && (
                  <div className="mt-3 text-center">
                    <a href="/archive" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      View all {archive.length} versions →
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Resume Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {optimizedResume ? "Optimized Resume" : "Mother Resume"}
            </h2>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <Resume
                resumeData={optimizedResume || motherResume}
                showDownloadButton={false}
                isGenerating={isOptimizing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to extract company name from job description
function extractCompanyFromJobDescription(jobDescription: string): string | null {
  const patterns = [
    /at ([A-Z][a-zA-Z\s&.]+?)(?:\s|,|\.|$)/,
    /join ([A-Z][a-zA-Z\s&.]+?)(?:\s|,|\.|$)/,
    /Company: ([A-Z][a-zA-Z\s&.]+?)(?:\s|,|\.|$)/,
    /([A-Z][a-zA-Z\s&.]+?) is (?:looking|seeking|hiring)/
  ];
  
  for (const pattern of patterns) {
    const match = jobDescription.match(pattern);
    if (match && match[1]) {
      return match[1].trim().split(' ').slice(0, 3).join(' '); // Max 3 words
    }
  }
  
  return null;
}
