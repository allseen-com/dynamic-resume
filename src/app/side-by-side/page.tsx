"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ResumeData } from "../../types/resume";
import { defaultResumeConfig } from "../../types/resume";
import { SECTION_IDS } from "../../utils/sectionPrompts";
import type { SectionId } from "../../utils/sectionPrompts";
import { getSectionPrompts, getSectionMaxWords } from "../../utils/sectionPrompts";
import type { SectionFragment } from "../../services/aiService";

const SECTION_LABELS: Record<SectionId, string> = {
  headline: "Headline / Title bar",
  summary: "Professional summary",
  technical: "Technical skills",
  experience: "Work experience",
};

function getMotherPreview(resume: ResumeData, sectionId: SectionId): string {
  switch (sectionId) {
    case "headline":
      return [defaultResumeConfig.titleBar.main, defaultResumeConfig.titleBar.sub].filter(Boolean).join("\n");
    case "summary":
      return resume.summary?.value ?? "";
    case "technical": {
      const comp = resume.coreCompetencies?.value ?? [];
      const tech = resume.technicalProficiency;
      const catLines = tech?.categories
        ? tech.categories.map((c) => `${c.category}: ${(c.items ?? []).join(", ")}`)
        : [];
      return [...comp, ...catLines].filter(Boolean).join("\n\n");
    }
    case "experience":
      return (resume.professionalExperience ?? [])
        .map(
          (r) =>
            `${r.company} | ${r.title} | ${r.dateRange}\n${(r.description?.value ?? "").slice(0, 400)}${(r.description?.value?.length ?? 0) > 400 ? "…" : ""}`
        )
        .join("\n\n");
    default:
      return "";
  }
}

function fragmentToPreview(fragment: SectionFragment): string {
  if ("titleBar" in fragment) {
    return [fragment.titleBar.main, fragment.titleBar.sub].filter(Boolean).join("\n");
  }
  if ("summary" in fragment) {
    return fragment.summary?.value ?? "";
  }
  if ("coreCompetencies" in fragment && "technicalProficiency" in fragment) {
    const comp = fragment.coreCompetencies?.value ?? [];
    const tech = fragment.technicalProficiency;
    const catLines =
      tech?.categories?.map((c: { category: string; items: string[] }) => `${c.category}: ${(c.items ?? []).join(", ")}`) ?? [];
    return [...comp, ...catLines].filter(Boolean).join("\n\n");
  }
  if ("professionalExperience" in fragment) {
    return (fragment.professionalExperience ?? [])
      .map(
        (r: { company: string; title: string; dateRange: string; description?: { value?: string } }) =>
          `${r.company} | ${r.title} | ${r.dateRange}\n${(r.description?.value ?? "").slice(0, 500)}${(r.description?.value?.length ?? 0) > 500 ? "…" : ""}`
      )
      .join("\n\n");
  }
  return "";
}

export default function SideBySidePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Partial<Record<SectionId, string>>>({});
  const [running, setRunning] = useState<Partial<Record<SectionId, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<SectionId, string>>>({});

  const loadResume = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resume");
      if (!res.ok) throw new Error("Failed to load resume");
      const data = await res.json();
      setResume(data as ResumeData);
    } catch {
      setResume(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResume();
  }, [loadResume]);

  const runSection = async (sectionId: SectionId) => {
    if (!resume || !jobDescription.trim()) return;
    setRunning((prev) => ({ ...prev, [sectionId]: true }));
    setErrors((prev) => ({ ...prev, [sectionId]: undefined }));
    try {
      const sectionPrompts = getSectionPrompts();
      const sectionMaxWords = getSectionMaxWords();
      const res = await fetch("/api/optimize-resume/section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
          sectionId,
          sectionPrompts,
          resumeData: resume,
          sectionMaxWords,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDrafts((prev) => ({ ...prev, [sectionId]: undefined }));
        setErrors((prev) => ({ ...prev, [sectionId]: data.error || "Request failed" }));
        return;
      }
      const preview = fragmentToPreview(data.fragment as SectionFragment);
      setDrafts((prev) => ({ ...prev, [sectionId]: preview }));
      setErrors((prev) => ({ ...prev, [sectionId]: undefined }));
    } catch (e) {
      setDrafts((prev) => ({ ...prev, [sectionId]: undefined }));
      setErrors((prev) => ({ ...prev, [sectionId]: e instanceof Error ? e.message : "Request failed" }));
    } finally {
      setRunning((prev) => ({ ...prev, [sectionId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!resume) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-600">Failed to load mother resume.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-500 hover:text-slate-700" aria-label="Back">
              ←
            </Link>
            <h1 className="heading-page">Side by Side</h1>
          </div>
        </div>
        <p className="text-slate-600 text-sm mb-4">
          Compare mother resume sections with AI-drafted output. Paste a job description, then run each section to health-check prompts and see customized results.
        </p>

        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Job description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here…"
            className="textarea-app w-full min-h-[120px] text-sm"
          />
        </section>

        <div className="space-y-6">
          {SECTION_IDS.map((sectionId) => {
            const motherText = getMotherPreview(resume, sectionId);
            const draftText = drafts[sectionId];
            const isRunning = running[sectionId];
            const error = errors[sectionId];
            return (
              <section
                key={sectionId}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <h2 className="text-sm font-semibold text-slate-800 bg-slate-100 px-4 py-2 border-b border-slate-200">
                  {SECTION_LABELS[sectionId]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-0 min-h-[200px]">
                  <div className="p-4 border-b md:border-b-0 md:border-r border-slate-200">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Mother</p>
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans overflow-auto max-h-[320px]">
                      {motherText || "—"}
                    </pre>
                  </div>
                  <div className="p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => runSection(sectionId)}
                      disabled={!jobDescription.trim() || isRunning}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {isRunning ? "…" : "Optimize"}
                    </button>
                    <p className="text-xs text-slate-500 mt-2 text-center">Run prompt</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Draft</p>
                    {error && (
                      <p className="text-xs text-red-600 mb-2">{error}</p>
                    )}
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans overflow-auto max-h-[320px]">
                      {draftText ?? (isRunning ? "Generating…" : "—")}
                    </pre>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
