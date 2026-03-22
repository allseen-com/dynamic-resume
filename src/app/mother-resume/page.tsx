"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ResumeData } from "../../types/resume";
import { defaultResumeConfig } from "../../types/resume";
import Resume from "../../components/Resume";

const LAST_INDEXED_KEY = "resumeLastIndexedAt";

export default function MotherResumePage() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [lastIndexedAt, setLastIndexedAt] = useState<string | null>(null);
  const [indexingResume, setIndexingResume] = useState(false);
  const [downloadType, setDownloadType] = useState<"pdf" | "docx" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resume");
      if (!res.ok) throw new Error("Failed to load resume");
      const json = await res.json();
      setData(json as ResumeData);
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Load failed" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLastIndexedAt(localStorage.getItem(LAST_INDEXED_KEY));
    }
  }, []);

  const handleIndexResume = async () => {
    if (!data) return;
    setIndexingResume(true);
    setMessage(null);
    try {
      const res = await fetch("/api/embed-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData: data }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to index resume");
      }
      const at = new Date().toISOString();
      localStorage.setItem(LAST_INDEXED_KEY, at);
      setLastIndexedAt(at);
      setMessage({ type: "ok", text: "Resume indexed. Match score and RAG will use this version." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Index failed" });
    } finally {
      setIndexingResume(false);
    }
  };

  const getDownloadFilename = (ext: string) => {
    const name = (data?.header?.name || "Mother-Resume").trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-]/g, "");
    return name ? `${name}_Mother-Resume.${ext}` : `Mother-Resume.${ext}`;
  };

  const handleDownloadPDF = async () => {
    if (!data) return;
    setDownloadType("pdf");
    setMessage(null);
    try {
      const res = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: data,
          config: defaultResumeConfig,
          filename: getDownloadFilename("pdf"),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.details || "Failed to generate PDF");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getDownloadFilename("pdf");
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: "ok", text: "PDF downloaded." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "PDF download failed" });
    } finally {
      setDownloadType(null);
    }
  };

  const handleDownloadDocx = async () => {
    if (!data) return;
    setDownloadType("docx");
    setMessage(null);
    try {
      const res = await fetch("/api/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeData: data,
          config: defaultResumeConfig,
          filename: getDownloadFilename("docx"),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.details || "Failed to generate DOCX");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getDownloadFilename("docx");
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: "ok", text: "DOCX downloaded." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "DOCX download failed" });
    } finally {
      setDownloadType(null);
    }
  };

  const handleDownloadJSON = () => {
    if (!data) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getDownloadFilename("json");
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: "ok", text: "JSON downloaded." });
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/optimize"
              className="text-slate-500 hover:text-slate-700"
              aria-label="Back to optimize hub"
            >
              ←
            </Link>
            <h1 className="heading-page">Mother Resume</h1>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 py-2 px-3 rounded text-sm ${message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            type="button"
            onClick={handleIndexResume}
            disabled={indexingResume || !data}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm font-medium"
          >
            {indexingResume ? "Indexing…" : "Index resume"}
          </button>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!!downloadType || !data}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
          >
            {downloadType === "pdf" ? "Generating…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={!!downloadType || !data}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium"
          >
            {downloadType === "docx" ? "Generating…" : "Download Docx"}
          </button>
          <button
            type="button"
            onClick={handleDownloadJSON}
            disabled={!data}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 text-sm font-medium"
          >
            Download JSON
          </button>
          {lastIndexedAt && (
            <span className="text-xs text-slate-500 ml-2">
              Last indexed: {new Date(lastIndexedAt).toLocaleString()}
            </span>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Resume
            resumeData={data}
            config={defaultResumeConfig}
            showDownloadButton={false}
            isGenerating={false}
          />
        </div>
      </div>
    </div>
  );
}
