"use client";

import React, { useState, useCallback, useEffect } from "react";
import type { ResumeData } from "../types/resume";
import { defaultResumeConfig } from "../types/resume";
import Resume from "../components/Resume";

export default function PublicResumeHomePage() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [downloadType, setDownloadType] = useState<"pdf" | null>(null);

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

  const getDownloadFilename = (ext: string) => {
    const name = (data?.header?.name || "Resume").trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-]/g, "");
    return name ? `${name}.${ext}` : `Resume.${ext}`;
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
        {message && (
          <div
            className={`mb-4 py-2 px-3 rounded text-sm ${message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
          >
            {message.text}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 mb-6">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!!downloadType || !data}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
          >
            {downloadType === "pdf" ? "Generating…" : "Download PDF"}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Resume resumeData={data} config={defaultResumeConfig} showDownloadButton={false} isGenerating={false} />
        </div>
      </div>
    </div>
  );
}
