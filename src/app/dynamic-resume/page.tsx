"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Resume from "../../components/Resume";
import type { ResumeData } from "../../types/resume";
import { defaultResumeConfig } from "../../types/resume";
import type { DynamicResumeBundle, DynamicResumeMedia, MergedTimelineItem } from "../../types/dynamicResume";
import { mergeAndSortTimeline } from "../../utils/dynamicResumeTimeline";
import dynamicResumeBundle from "../../../data/dynamic-resume.json";

const bundle = dynamicResumeBundle as DynamicResumeBundle;

function linkedRoleLabel(resume: ResumeData, experienceIndex?: number): string | null {
  if (experienceIndex == null) return null;
  const job = resume.professionalExperience[experienceIndex];
  if (!job) return null;
  return `${job.company} — ${job.title}`;
}

function youtubeEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const parts = u.pathname.split("/").filter(Boolean);
      const i = parts.indexOf("embed");
      if (i >= 0 && parts[i + 1]) return `https://www.youtube.com/embed/${parts[i + 1]}`;
      const si = parts.indexOf("shorts");
      if (si >= 0 && parts[si + 1]) return `https://www.youtube.com/embed/${parts[si + 1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

function vimeoEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host !== "vimeo.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const id = parts[0];
    if (!id || !/^\d+$/.test(id)) return null;
    return `https://player.vimeo.com/video/${id}`;
  } catch {
    return null;
  }
}

function VideoEmbed({ url, title }: { url: string; title: string }) {
  const yt = youtubeEmbedSrc(url);
  const vm = yt ? null : vimeoEmbedSrc(url);
  const src = yt ?? vm;
  if (!src) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline"
      >
        Open video
      </a>
    );
  }
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-slate-200 bg-black aspect-video">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function MediaBlock({ media, title }: { media: DynamicResumeMedia; title: string }) {
  if (media.kind === "image") {
    return (
      <figure className="mt-3 space-y-1">
        <img
          src={media.url}
          alt={media.alt ?? ""}
          className="w-full max-h-64 rounded-lg border border-slate-200 object-cover"
        />
        {media.caption && (
          <figcaption className="text-xs text-slate-500">{media.caption}</figcaption>
        )}
      </figure>
    );
  }
  return (
    <div className="mt-3 space-y-1">
      <VideoEmbed url={media.url} title={title} />
      {media.caption && <p className="text-xs text-slate-500">{media.caption}</p>}
    </div>
  );
}

function TimelineCard({
  item,
  resume,
}: {
  item: MergedTimelineItem;
  resume: ResumeData;
}) {
  const isRole = item.kind === "role";
  const trace = !isRole ? linkedRoleLabel(resume, item.experienceIndex) : null;

  return (
    <article
      className={`relative pl-8 pb-10 border-l-2 last:border-l-transparent last:pb-0 ${
        isRole ? "border-indigo-200" : "border-amber-200"
      }`}
    >
      <div
        className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white ${
          isRole ? "bg-indigo-600" : "bg-amber-500"
        }`}
        aria-hidden
      />
      <div className="flex flex-wrap items-center gap-2 gap-y-1">
        <span
          className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${
            isRole ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-900"
          }`}
        >
          {isRole ? "Role" : "Milestone"}
        </span>
        <time className="text-sm text-slate-500">{item.dateLabel}</time>
      </div>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">{item.title}</h3>
      {item.subtitle && <p className="text-sm font-medium text-slate-600">{item.subtitle}</p>}
      <p className="mt-2 text-sm text-slate-700 leading-relaxed">{item.summary}</p>
      {trace && (
        <p className="mt-2 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Linked role:</span> {trace}
        </p>
      )}
      {item.tags && item.tags.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {item.tags.map((t) => (
            <li key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              {t}
            </li>
          ))}
        </ul>
      )}
      {item.media?.map((m, i) => (
        <MediaBlock key={`${item.id}-m-${i}`} media={m} title={item.title} />
      ))}
      {item.links && item.links.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-3">
          {item.links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-800 underline"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

export default function DynamicResumePage() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/resume");
      if (!res.ok) throw new Error("Failed to load resume");
      const json = await res.json();
      setData(json as ResumeData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const timeline = useMemo(() => {
    if (!data) return [];
    return mergeAndSortTimeline(data, bundle.curatedTimeline);
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <p className="text-red-700">{error ?? "No resume data."}</p>
          <button
            type="button"
            onClick={load}
            className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto py-6 px-4">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-slate-500 hover:text-slate-700" aria-label="Back to home">
              ←
            </Link>
            <div>
              <h1 className="heading-page">Dynamic Resume</h1>
              <p className="text-slate-600 mt-1 max-w-2xl">{bundle.meta.tagline}</p>
              {bundle.meta.lastUpdated && (
                <p className="text-xs text-slate-400 mt-1">Last updated (manual): {bundle.meta.lastUpdated}</p>
              )}
            </div>
          </div>
          <Link
            href="/mother-resume"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
          >
            Canonical mother resume →
          </Link>
        </div>

        <section className="mb-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Case studies</h2>
          <p className="text-sm text-slate-600 mb-4">
            External proof and narratives — swap placeholders in{" "}
            <code className="text-xs bg-slate-200 px-1 rounded">data/dynamic-resume.json</code>.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bundle.caseStudies.map((cs) => {
              const trace = linkedRoleLabel(data, cs.experienceIndex);
              return (
                <a
                  key={cs.id}
                  href={cs.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all"
                >
                  {cs.thumbnailUrl ? (
                    <img
                      src={cs.thumbnailUrl}
                      alt=""
                      className="h-36 w-full object-cover group-hover:opacity-95"
                    />
                  ) : (
                    <div className="h-24 bg-gradient-to-br from-indigo-100 to-slate-100" />
                  )}
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{cs.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 flex-1">{cs.excerpt}</p>
                    {trace && (
                      <p className="text-xs text-slate-500 mt-3">
                        <span className="font-medium text-slate-600">Linked role:</span> {trace}
                      </p>
                    )}
                    {cs.tags && cs.tags.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-1">
                        {cs.tags.map((t) => (
                          <li key={t} className="text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                            {t}
                          </li>
                        ))}
                      </ul>
                    )}
                    <span className="text-sm font-medium text-indigo-600 mt-3">Open link →</span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Timeline</h2>
          <p className="text-sm text-slate-600 mb-6">
            Roles from your mother resume plus curated milestones (reverse chronological).
          </p>
          <div className="ml-1">{timeline.map((item) => (
            <TimelineCard key={item.id} item={item} resume={data} />
          ))}</div>
        </section>

        <details className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden group">
          <summary className="cursor-pointer px-4 py-3 font-medium text-slate-800 bg-slate-50 hover:bg-slate-100 list-none flex items-center justify-between">
            <span>Mother resume preview</span>
            <span className="text-slate-400 text-sm group-open:hidden">Show</span>
            <span className="text-slate-400 text-sm hidden group-open:inline">Hide</span>
          </summary>
          <div className="p-4 border-t border-slate-200 overflow-x-auto">
            <Resume
              resumeData={data}
              config={defaultResumeConfig}
              showDownloadButton={false}
              isGenerating={false}
            />
          </div>
        </details>
      </div>
    </div>
  );
}
