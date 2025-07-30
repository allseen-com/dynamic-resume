"use client";
import React, { useEffect, useState } from "react";
import { ResumeData, ResumeConfig } from "../../types/resume";

interface ResumeArchiveItem {
  label: string;
  data: ResumeData;
  config: ResumeConfig;
  isCurrent: boolean;
  date: string;
}

function hasJobDescription(data: ResumeData): data is ResumeData & { jobDescription: string } {
  return typeof data === 'object' && data !== null && 'jobDescription' in data && typeof (data as Record<string, unknown>).jobDescription === 'string';
}

function JobDescription({ data }: { data: ResumeData }) {
  if (hasJobDescription(data)) {
    return (
      <div className="mt-4 pt-4 border-t border-slate-200">
        <span className="text-sm font-medium text-slate-700 block mb-2">Job Description:</span>
        <pre className="whitespace-pre-wrap bg-slate-50 p-3 rounded-lg text-xs text-slate-600 max-h-32 overflow-y-auto">{data.jobDescription}</pre>
      </div>
    );
  }
  return null;
}

export default function ArchivePage() {
  const [archive, setArchive] = useState<ResumeArchiveItem[]>([]);
  const [pdfLoadingIdx, setPdfLoadingIdx] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("resumeArchive") || "[]");
      setArchive(stored);
    }
  }, []);

  const setAsCurrent = (idx: number) => {
    const newArchive = archive.map((item, i) => ({ ...item, isCurrent: i === idx }));
    setArchive(newArchive);
    if (typeof window !== "undefined") {
      localStorage.setItem("resumeArchive", JSON.stringify(newArchive));
    }
  };

  const downloadResume = (item: ResumeArchiveItem) => {
    const blob = new Blob([JSON.stringify(item.data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.label.replace(/\s+/g, "_")}_resume.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async (item: ResumeArchiveItem, idx: number) => {
    setPdfLoadingIdx(idx);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: item.data, config: item.config }),
      });
      if (!res.ok) {
        alert("Failed to generate PDF");
        setPdfLoadingIdx(null);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.label.replace(/\s+/g, "_")}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("PDF download failed");
    } finally {
      setPdfLoadingIdx(null);
    }
  };

  if (!isClient) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 text-slate-900">Resume Archive</h1>
          <p className="text-slate-600">Access your previously generated resumes, set one as current, or download as PDF or JSON.</p>
        </div>
        {archive.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">No archived resumes found</h3>
            <p className="text-slate-500">Start optimizing your resume to build your archive.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {archive.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">{item.label}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(item.date).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.isCurrent ? (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium">Current</span>
                    ) : (
                      <button
                        onClick={() => setAsCurrent(idx)}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                      >
                        Set as Current
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => downloadResume(item)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  >
                    <span>📄</span>
                    Download JSON
                  </button>
                  <button
                    onClick={() => downloadPDF(item, idx)}
                    className={`flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors ${pdfLoadingIdx === idx ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={pdfLoadingIdx === idx}
                  >
                    <span>📊</span>
                    {pdfLoadingIdx === idx ? 'Generating PDF...' : 'Download PDF'}
                  </button>
                </div>
                
                <JobDescription data={item.data} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 