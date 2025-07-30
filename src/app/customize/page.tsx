"use client";

import React, { useState, useEffect } from "react";
import Resume from "../../components/Resume";
import { ResumeData, ResumeConfig } from "../../types/resume";
import { generateAICustomizedResume } from "../../utils/aiResumeGenerator";
import { useErrorHandler } from "../../utils/errorHandler";
import { AIProcessingLoader, URLExtractionLoader, PDFGenerationLoader, LoadingOverlay } from "../../components/LoadingSpinner";
import { PROMPT_TEMPLATES, getDefaultPrompt } from "../../utils/promptTemplates";
import resumeData from "../../../data/resume.json";

type ResumeArchiveItem = {
  label: string;
  data: ResumeData;
  config: ResumeConfig;
  isCurrent: boolean;
  date: string;
};

// Simple Toast component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2500);
    return () => clearTimeout(timer);
  }, [onClose]);
  return (
    <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
      {message}
    </div>
  );
}

export default function CustomizePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [aiPrompt, setAiPrompt] = useState(getDefaultPrompt());
  const [selectedTemplate, setSelectedTemplate] = useState("general");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingType, setLoadingType] = useState<"url" | "ai" | "pdf" | null>(null);
  const [customizedResumeData, setCustomizedResumeData] = useState<ResumeData>(resumeData as ResumeData);
  const [customizedConfig, setCustomizedConfig] = useState<ResumeConfig>({
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
  });
  const [error, setError] = useState<string | null>(null);
  const { handleErrorWithState } = useErrorHandler();
  const [companyOrRole, setCompanyOrRole] = useState<string | undefined>(undefined);

  // Archive state
  const [archive, setArchive] = useState<ResumeArchiveItem[]>([]);
  const [archiveLabel, setArchiveLabel] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [highlightSections, setHighlightSections] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load archive from localStorage
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("resumeArchive") || "[]");
      setArchive(stored);
    }
  }, []);

  const saveToArchive = () => {
    if (!archiveLabel.trim()) {
      setError("Please enter a label for the archive.");
      return;
    }
    const newArchive = [
      ...archive,
      {
        label: archiveLabel,
        data: customizedResumeData,
        config: customizedConfig,
        isCurrent: false,
        date: new Date().toISOString(),
      },
    ];
    setArchive(newArchive);
    localStorage.setItem("resumeArchive", JSON.stringify(newArchive));
    setArchiveLabel("");
    setError(null);
  };

  const setAsCurrent = (idx: number) => {
    const newArchive = archive.map((item, i) => ({ ...item, isCurrent: i === idx }));
    setArchive(newArchive);
    localStorage.setItem("resumeArchive", JSON.stringify(newArchive));
    setError(null);
  };

  const handleJobUrlExtraction = async () => {
    if (!jobUrl.trim()) {
      handleErrorWithState("Please enter a valid URL", setError, "validation", "URL");
      return;
    }
    setIsGenerating(true);
    setLoadingType("url");
    setError(null);
    try {
      const { createURLExtractor } = await import("../../services/urlExtractor");
      const extractor = createURLExtractor();
      const result = await extractor.extractJobDescription(jobUrl);
      if (result.success && result.content) {
        setJobDescription(result.content);
        setError(null);
      } else {
        handleErrorWithState(result.error || "Failed to extract job description from URL", setError, "url");
      }
    } catch (error) {
      handleErrorWithState(error, setError, "url");
    } finally {
      setIsGenerating(false);
      setLoadingType(null);
    }
  };

  const handleGenerateResume = async () => {
    if (!jobDescription.trim()) {
      handleErrorWithState("Please provide a job description", setError, "validation", "job description");
      return;
    }
    setIsGenerating(true);
    setLoadingType("ai");
    setError(null);
    try {
      const result = await generateAICustomizedResume({
        jobDescription,
        customPrompt: aiPrompt,
        baseResumeData: resumeData as ResumeData,
      });
      setCustomizedResumeData(result.resumeData);
      setCustomizedConfig(result.config);
      setCompanyOrRole(result.companyOrRole); // Store extracted company/role
      setShowSuccess(true);
      setHighlightSections(["summary", "coreCompetencies", "technicalProficiency", "professionalExperience"]); // highlight all main sections for now
    } catch (error) {
      handleErrorWithState(error, setError, "ai");
    } finally {
      setIsGenerating(false);
      setLoadingType(null);
    }
  };

  const handleDownloadPDF = async () => {
    setIsGenerating(true);
    setLoadingType("pdf");
    setError(null);
    try {
      // Sanitize companyOrRole for filename (remove special chars, spaces to underscores)
      let safeName = companyOrRole ? companyOrRole.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+|_+$/g, '') : '';
      if (!safeName) safeName = 'Custom';
      const filename = `Resume-${safeName}.pdf`;
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeData: customizedResumeData,
          config: customizedConfig,
          jobDescription: jobDescription,
          aiPrompt: aiPrompt,
          filename, // Pass filename to API
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.details || errorData.error || "Failed to generate PDF";
        handleErrorWithState(new Error(errorMessage), setError, "pdf");
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      handleErrorWithState(error, setError, "pdf");
    } finally {
      setIsGenerating(false);
      setLoadingType(null);
    }
  };

  const resetToDefault = () => {
    setCustomizedResumeData(resumeData as ResumeData);
    setCustomizedConfig({
      titleBar: {
        main: "Performance Marketing / Marketing Data Analysis / Technical Project Manager",
        sub: "Business Development | Digital Marketing Strategy | Performance Optimizations",
      },
      sections: {
        showTechnicalProficiency: true,
        showCoreCompetencies: true,
        showProfessionalExperience: true,
        showEducation: true,
        showCertifications: true,
      },
    });
    setJobDescription("");
    setJobUrl("");
    setError(null);
    setLoadingType(null);
    setAiPrompt(getDefaultPrompt());
    setSelectedTemplate("general");
  };

  if (!isClient) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showSuccess && (
        <Toast message="Resume updated with AI customization!" onClose={() => setShowSuccess(false)} />
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Advanced Customization</h1>
          <p className="text-slate-600">
            Fine-tune your resume with custom AI prompts and advanced URL extraction features.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Input Controls */}
          <div className="space-y-6">
            {/* Job Description Input */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Job Description</h2>
              <LoadingOverlay isVisible={loadingType === "url"}>
                <URLExtractionLoader />
              </LoadingOverlay>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Job Posting URL (Optional)
                </label>
                <div className="flex gap-3">
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://company.com/jobs/position"
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-500"
                  />
                  <button
                    onClick={handleJobUrlExtraction}
                    disabled={isGenerating || !jobUrl.trim()}
                    className="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {loadingType === "url" ? "🔄 Extracting..." : "🔗 Extract"}
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Job Description Text
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateResume}
                  disabled={isGenerating || !jobDescription.trim()}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isGenerating || !jobDescription.trim()
                      ? "bg-slate-400 cursor-not-allowed text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg"
                  }`}
                >
                  {loadingType === "ai" ? "🤖 AI Customizing..." : "🤖 Generate Custom Resume"}
                </button>
                <button
                  onClick={resetToDefault}
                  className="px-4 py-3 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-medium transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            {/* AI Prompt Editor */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">AI Prompt Customization</h2>
              <p className="text-sm text-slate-600 mb-4">
                Choose a template optimized for your target role, or customize the prompt to control how AI adapts your resume.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Prompt Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    const template = PROMPT_TEMPLATES.find((t) => t.id === e.target.value);
                    if (template) {
                      setSelectedTemplate(e.target.value);
                      setAiPrompt(template.prompt);
                    }
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900"
                >
                  {PROMPT_TEMPLATES.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm text-slate-900"
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    const template = PROMPT_TEMPLATES.find((t) => t.id === selectedTemplate);
                    if (template) {
                      setAiPrompt(template.prompt);
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                >
                  Reset to Template
                </button>
                <button
                  onClick={() => {
                    setSelectedTemplate("general");
                    setAiPrompt(getDefaultPrompt());
                  }}
                  className="px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-medium transition-colors"
                >
                  Reset to Default
                </button>
              </div>
            </div>
            {/* Archive Feature */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Resume Archive</h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={archiveLabel}
                  onChange={(e) => setArchiveLabel(e.target.value)}
                  placeholder="Label for this version (e.g. 'Google PM', 'Meta Data Analyst')"
                                      className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-500"
                  />
                  <button
                    onClick={saveToArchive}
                    className="px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors"
                  >
                    Save to Archive
                  </button>
              </div>
              {archive.length > 0 && (
                <div className="space-y-2">
                  {archive.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 border rounded-md">
                      <span className="flex-1 truncate">{item.label} <span className="text-xs text-gray-400">({new Date(item.date).toLocaleString()})</span></span>
                      {item.isCurrent ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Current</span>
                      ) : (
                        <button
                          onClick={() => setAsCurrent(idx)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          Set as Current
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Right Panel - Resume Preview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Live Preview</h2>
                <p className="text-sm text-slate-600">Your customized resume</p>
              </div>
              <button
                onClick={handleDownloadPDF}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isGenerating
                    ? "bg-slate-400 cursor-not-allowed text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                {loadingType === "pdf" ? "🔄 Generating..." : "📄 Download PDF"}
              </button>
            </div>
            <div className="p-6 max-h-screen overflow-y-auto">
              <Resume
                resumeData={customizedResumeData}
                config={customizedConfig}
                showDownloadButton={false}
                isGenerating={isGenerating}
                highlightSections={highlightSections}
              />
            </div>
            <LoadingOverlay isVisible={loadingType === "ai"}>
              <AIProcessingLoader />
            </LoadingOverlay>
            <LoadingOverlay isVisible={loadingType === "pdf"}>
              <PDFGenerationLoader />
            </LoadingOverlay>
          </div>
        </div>
      </div>
    </div>
  );
} 