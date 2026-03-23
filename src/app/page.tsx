"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import type { ResumeData } from "../types/resume";
import { defaultResumeConfig } from "../types/resume";
import Resume from "../components/Resume";
import { RESUME_LAST_INDEXED_AT_KEY } from "../lib/resumeIndexStorage";

const actionBtn =
  "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50";

export default function PublicResumeHomePage() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [downloadType, setDownloadType] = useState<"pdf" | "docx" | null>(null);
  const [lastIndexedAt, setLastIndexedAt] = useState<string | null>(null);

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
    const readIndexed = () => {
      if (typeof window === "undefined") return;
      setLastIndexedAt(localStorage.getItem(RESUME_LAST_INDEXED_AT_KEY));
    };
    readIndexed();
    const onVisibility = () => {
      if (document.visibilityState === "visible") readIndexed();
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === RESUME_LAST_INDEXED_AT_KEY || e.key === null) readIndexed();
    };
    window.addEventListener("focus", readIndexed);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", readIndexed);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const getDownloadFilename = (ext: string) => {
    const name = (data?.header?.name || "Resume").trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-]/g, "");
    return name ? `${name}_Resume.${ext}` : `Resume.${ext}`;
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
      setMessage({ type: "ok", text: "Word document downloaded." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "DOCX download failed" });
    } finally {
      setDownloadType(null);
    }
  };

  const handleDownloadJSON = () => {
    if (!data) return;
    setMessage(null);
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = getDownloadFilename("json");
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: "ok", text: "JSON downloaded." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "JSON download failed" });
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

        <div className="flex flex-wrap items-center justify-end gap-2 mb-2">
          <Link
            href="/optimize"
            className={`${actionBtn} bg-indigo-600 text-white hover:bg-indigo-700`}
          >
            Optimize
          </Link>
          <Link
            href="/customize"
            className={`${actionBtn} border-2 border-indigo-600 text-indigo-700 bg-white hover:bg-indigo-50`}
          >
            Customize
          </Link>
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={!!downloadType || !data}
            className={`${actionBtn} bg-red-600 text-white hover:bg-red-700`}
          >
            {downloadType === "pdf" ? "Generating…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={!!downloadType || !data}
            className={`${actionBtn} bg-blue-600 text-white hover:bg-blue-700`}
          >
            {downloadType === "docx" ? "Generating…" : "Download Word"}
          </button>
          <button
            type="button"
            onClick={handleDownloadJSON}
            disabled={!data}
            className={`${actionBtn} bg-slate-600 text-white hover:bg-slate-700`}
          >
            Download JSON
          </button>
        </div>

        <p className="text-xs text-slate-500 text-right mb-6 min-h-[1.25rem]">
          {lastIndexedAt ? (
            <>
              Last resume index (this browser):{" "}
              <span className="text-slate-600 font-medium">{new Date(lastIndexedAt).toLocaleString()}</span>
              {" — "}
              used for match score / RAG after you index from Mother resume.
            </>
          ) : (
            <>
              No index timestamp in this browser yet. After you unlock tooling, use <strong>Mother resume</strong> →
              &quot;Index resume&quot; to refresh match/RAG; the time will show here.
            </>
          )}
        </p>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Resume resumeData={data} config={defaultResumeConfig} showDownloadButton={false} isGenerating={false} />
        </div>
      </div>
    </div>
  );
}
