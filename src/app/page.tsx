"use client";

import React, { useState, useEffect } from "react";
import Resume from "../components/Resume";
import { ResumeData, ResumeConfig } from "../types/resume";
import { generateAICustomizedResume } from "../utils/aiResumeGenerator";
import { useErrorHandler } from "../utils/errorHandler";
import { AIProcessingLoader, URLExtractionLoader, PDFGenerationLoader, LoadingOverlay } from "../components/LoadingSpinner";
import { getDefaultPrompt } from "../utils/promptTemplates";
import resumeData from "../../data/resume.json";

const DRAFT_VERSION_LABELS = ["Technical", "Leadership", "Growth"] as const;
type DraftVersionLabel = (typeof DRAFT_VERSION_LABELS)[number];

type ResumeArchiveItem = {
  label: string;
  data: ResumeData;
  config: ResumeConfig;
  isCurrent: boolean;
  date: string;
  version?: DraftVersionLabel;
};

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
      {message}
    </div>
  );
}

export default function HomePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [savedPrompt, setSavedPrompt] = useState(getDefaultPrompt());
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingType, setLoadingType] = useState<"url" | "ai" | "pdf" | null>(null);
  const [motherResumeData, setMotherResumeData] = useState<ResumeData>(resumeData as ResumeData);
  const [customizedResumeData, setCustomizedResumeData] = useState<ResumeData>(resumeData as ResumeData);
  const [customizedConfig, setCustomizedConfig] = useState<ResumeConfig>({
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
  const [error, setError] = useState<string | null>(null);
  const { handleErrorWithState } = useErrorHandler();
  const [companyOrRole, setCompanyOrRole] = useState<string | undefined>(undefined);
  const [archive, setArchive] = useState<ResumeArchiveItem[]>([]);
  const [archiveLabel, setArchiveLabel] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [highlightSections, setHighlightSections] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [groundingVerified, setGroundingVerified] = useState(false);
  const [pineconeConfigured, setPineconeConfigured] = useState(false);
  const [lastIndexedAt, setLastIndexedAt] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"single" | "side-by-side">("single");
  const [archiveVersion, setArchiveVersion] = useState<DraftVersionLabel | "">("");

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setArchive(JSON.parse(localStorage.getItem("resumeArchive") || "[]"));
      setSavedPrompt(localStorage.getItem("customAIPrompt") || getDefaultPrompt());
      setLastIndexedAt(localStorage.getItem("resumeLastIndexedAt"));
    }
  }, []);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "resumeLastIndexedAt" && e.newValue) setLastIndexedAt(e.newValue);
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible" && typeof window !== "undefined") {
        setLastIndexedAt(localStorage.getItem("resumeLastIndexedAt"));
      }
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    fetch("/api/admin/pinecone-status")
      .then((r) => r.json())
      .then((d) => setPineconeConfigured(d.configured === true))
      .catch(() => setPineconeConfigured(false));
  }, []);

  useEffect(() => {
    fetch("/api/resume")
      .then((r) => r.json())
      .then((data) => setMotherResumeData(data as ResumeData))
      .catch(() => {});
  }, []);

  const saveToArchive = () => {
    if (!archiveLabel.trim()) {
      setError("Please enter a label for the archive.");
      return;
    }
    const newArchive: ResumeArchiveItem[] = [
      ...archive,
      {
        label: archiveLabel,
        data: customizedResumeData,
        config: customizedConfig,
        isCurrent: false,
        date: new Date().toISOString(),
        ...(archiveVersion ? { version: archiveVersion as DraftVersionLabel } : {}),
      },
    ];
    setArchive(newArchive);
    localStorage.setItem("resumeArchive", JSON.stringify(newArchive));
    setArchiveLabel("");
    setArchiveVersion("");
    setError(null);
  };

  const setAsCurrent = (idx: number) => {
    const next = archive.map((item, i) => ({ ...item, isCurrent: i === idx }));
    setArchive(next);
    localStorage.setItem("resumeArchive", JSON.stringify(next));
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
      const { createURLExtractor } = await import("../services/urlExtractor");
      const extractor = createURLExtractor();
      const result = await extractor.extractJobDescription(jobUrl);
      if (result.success && result.content) {
        setJobDescription(result.content);
        setError(null);
      } else {
        handleErrorWithState(result.error || "Failed to extract job description from URL", setError, "url");
      }
    } catch (e) {
      handleErrorWithState(e, setError, "url");
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
        customPrompt: savedPrompt,
        baseResumeData: motherResumeData,
      });
      setCustomizedResumeData(result.resumeData);
      setCustomizedConfig(result.config);
      setCompanyOrRole(result.companyOrRole);
      setMatchScore(result.matchScore ?? null);
      setGroundingVerified(result.groundingVerified === true);
      setShowSuccess(true);
      setHighlightSections(["summary", "coreCompetencies", "technicalProficiency", "professionalExperience"]);
    } catch (e) {
      handleErrorWithState(e, setError, "ai");
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
      const { getExportFilenameFromResume } = await import("../utils/safeParseFilename");
      const fullName = (customizedResumeData as ResumeData)?.header?.name ?? "Resume";
      const filename = getExportFilenameFromResume(fullName, companyOrRole);
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: customizedResumeData,
          config: customizedConfig,
          jobDescription,
          aiPrompt: savedPrompt,
          filename,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        handleErrorWithState(new Error(err.details || err.error || "Failed to generate PDF"), setError, "pdf");
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
    } catch (e) {
      handleErrorWithState(e, setError, "pdf");
    } finally {
      setIsGenerating(false);
      setLoadingType(null);
    }
  };

  const resetToDefault = () => {
    setCustomizedResumeData(motherResumeData);
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
    setMatchScore(null);
    setGroundingVerified(false);
  };

  if (!isClient) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {showSuccess && (
        <Toast message="Resume updated with AI customization!" onClose={() => setShowSuccess(false)} />
      )}

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Full-width: Job Description */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative">
          <h2 className="heading-section">Job Description</h2>
          <LoadingOverlay isVisible={loadingType === "url"}>
            <URLExtractionLoader />
          </LoadingOverlay>
          <div className="mb-4">
            <label className="label-app">Job posting URL (optional)</label>
            <div className="flex flex-wrap gap-3">
              <input
                type="url"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                placeholder="https://company.com/jobs/position"
                className="input-app flex-1 min-w-[200px]"
              />
              <button
                onClick={handleJobUrlExtraction}
                disabled={isGenerating || !jobUrl.trim()}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed font-medium text-sm transition-colors"
              >
                {loadingType === "url" ? "Extracting…" : "Extract"}
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="label-app">Job description text</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={6}
              className="textarea-app w-full"
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={handleGenerateResume}
              disabled={isGenerating || !jobDescription.trim()}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                isGenerating || !jobDescription.trim()
                  ? "bg-slate-400 cursor-not-allowed text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {loadingType === "ai" ? "Customizing…" : "Generate custom resume"}
            </button>
            <button
              onClick={resetToDefault}
              className="px-4 py-2.5 bg-slate-500 text-white rounded-lg hover:bg-slate-600 font-medium text-sm transition-colors"
            >
              Reset
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {/* Full-width: Live Preview */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="heading-section mb-0">Live preview</h2>
              {lastIndexedAt && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                  Mother resume vectorized on {new Date(lastIndexedAt).toLocaleDateString()}
                </span>
              )}
              <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("single")}
                  className={`px-3 py-1.5 text-sm font-medium ${viewMode === "single" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                  Single
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("side-by-side")}
                  className={`px-3 py-1.5 text-sm font-medium ${viewMode === "side-by-side" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
                >
                  Mother vs draft
                </button>
              </div>
              {(matchScore != null || groundingVerified) && (
                <div className="flex flex-wrap gap-2 text-sm">
                  {matchScore != null && (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-indigo-100 text-indigo-800">
                      Match: {Math.round(matchScore * 100)}%
                    </span>
                  )}
                  {groundingVerified && (
                    <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-100 text-emerald-800">
                      Grounding verified
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${isGenerating ? "bg-slate-400 cursor-not-allowed text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
            >
              {loadingType === "pdf" ? "Generating…" : "Download PDF"}
            </button>
          </div>
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {viewMode === "side-by-side" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                  <div className="px-3 py-2 border-b border-slate-200 text-sm font-medium text-slate-600 bg-slate-100">
                    Mother resume
                  </div>
                  <div className="p-3 overflow-y-auto max-h-[65vh]">
                    <Resume
                      resumeData={motherResumeData}
                      config={customizedConfig}
                      showDownloadButton={false}
                      isGenerating={false}
                    />
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-200 text-sm font-medium text-slate-700 bg-indigo-50">
                    Optimized draft
                  </div>
                  <div className="p-3 overflow-y-auto max-h-[65vh]">
                    <Resume
                      resumeData={customizedResumeData}
                      config={customizedConfig}
                      showDownloadButton={false}
                      isGenerating={isGenerating}
                      highlightSections={highlightSections}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Resume
                resumeData={customizedResumeData}
                config={customizedConfig}
                showDownloadButton={false}
                isGenerating={isGenerating}
                highlightSections={highlightSections}
              />
            )}
          </div>
          <LoadingOverlay isVisible={loadingType === "ai"}>
            <AIProcessingLoader />
          </LoadingOverlay>
          <LoadingOverlay isVisible={loadingType === "pdf"}>
            <PDFGenerationLoader />
          </LoadingOverlay>
        </section>

        {/* Archive */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="heading-section">Resume archive</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            <input
              type="text"
              value={archiveLabel}
              onChange={(e) => setArchiveLabel(e.target.value)}
              placeholder="Label (e.g. Google PM)"
              className="input-app flex-1 min-w-[140px]"
            />
            <select
              value={archiveVersion}
              onChange={(e) => setArchiveVersion(e.target.value as DraftVersionLabel | "")}
              className="input-app w-auto"
              title="Focus"
            >
              <option value="">Focus</option>
              {DRAFT_VERSION_LABELS.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <button
              onClick={saveToArchive}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm"
            >
              Save to archive
            </button>
          </div>
          {archive.length > 0 && (
            <>
              <div className="space-y-2">
              {archive.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg flex-wrap">
                  <span className="flex-1 min-w-0 truncate text-sm text-slate-900">
                    {item.label} <span className="text-xs text-slate-400">({new Date(item.date).toLocaleString()})</span>
                  </span>
                  {item.version && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">{item.version}</span>
                  )}
                  {item.isCurrent ? (
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">Current</span>
                  ) : (
                    <button
                      onClick={() => setAsCurrent(idx)}
                      className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700"
                    >
                      Set current
                    </button>
                  )}
                </div>
              ))}
            </div>
              <p className="mt-3 text-sm">
                <a href="/archive" className="text-indigo-600 hover:text-indigo-800 font-medium">
                  View all in Archive →
                </a>
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
