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
      <div className="text-xs text-gray-700 mt-2">
        <span className="font-semibold">Job Description:</span>
        <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded mt-1">{data.jobDescription}</pre>
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
    return <div className="min-h-screen bg-gray-100" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-blue-900">Resume Archive</h1>
        <p className="mb-8 text-gray-600">Access your previously generated resumes, set one as current, or download as PDF or JSON.</p>
        {archive.length === 0 ? (
          <div className="text-gray-500">No archived resumes found.</div>
        ) : (
          <div className="space-y-6">
            {archive.map((item, idx) => (
              <div key={idx} className="border rounded-lg p-5 flex flex-col gap-2 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-blue-900 flex-1 text-lg">{item.label}</span>
                  <span className="text-xs text-gray-400">{new Date(item.date).toLocaleString()}</span>
                  {item.isCurrent ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Current</span>
                  ) : (
                    <button
                      onClick={() => setAsCurrent(idx)}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                    >
                      Set as Current
                    </button>
                  )}
                  <button
                    onClick={() => downloadResume(item)}
                    className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 ml-2 transition-colors"
                  >
                    Download JSON
                  </button>
                  <button
                    onClick={() => downloadPDF(item, idx)}
                    className={`px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 ml-2 transition-colors ${pdfLoadingIdx === idx ? 'opacity-60 cursor-not-allowed' : ''}`}
                    disabled={pdfLoadingIdx === idx}
                  >
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