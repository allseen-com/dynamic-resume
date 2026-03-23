import type { ResumeData } from "../types/resume";
import type {
  DynamicResumeCuratedTimelineItem,
  MergedTimelineItem,
} from "../types/dynamicResume";

const MONTH_YEAR = /^(\d{1,2})\/(\d{4})$/;

function parseMonthYear(s: string): number | null {
  const t = s.trim();
  const m = t.match(MONTH_YEAR);
  if (!m) return null;
  const month = parseInt(m[1], 10) - 1;
  const year = parseInt(m[2], 10);
  if (month < 0 || month > 11) return null;
  return Date.UTC(year, month, 1);
}

/** Parse resume `dateRange` for sorting only; display should keep the original string. */
export function parseResumeDateRangeSortMs(dateRange: string): {
  startMs: number;
  endMs: number;
} {
  const raw = dateRange.split(/\s*(?:\u2013|-)\s*/).filter(Boolean);
  if (raw.length < 2) {
    const now = Date.now();
    return { startMs: now, endMs: now };
  }
  const left = raw[0].trim();
  const right = raw.slice(1).join("–").trim();
  const startMs = parseMonthYear(left) ?? Date.UTC(1970, 0, 1);
  const isPresent = /^present$/i.test(right);
  const endMs = isPresent
    ? Date.now()
    : parseMonthYear(right) ?? Date.now();
  return { startMs, endMs };
}

function firstParagraph(text: string, maxLen = 220): string {
  const t = text.trim();
  if (!t) return "";
  const first = t.split(/\n\n+/)[0]?.replace(/\n/g, " ").trim() ?? t;
  if (first.length <= maxLen) return first;
  return `${first.slice(0, maxLen).trim()}…`;
}

function jobTimelineItems(resume: ResumeData): MergedTimelineItem[] {
  return resume.professionalExperience.map((job, experienceIndex) => {
    const { endMs } = parseResumeDateRangeSortMs(job.dateRange);
    const summary = firstParagraph(job.description.value);
    return {
      id: `role-${experienceIndex}-${job.company.slice(0, 20)}`,
      kind: "role",
      sortKeyMs: endMs,
      title: job.title,
      subtitle: job.company,
      dateLabel: job.dateRange,
      summary,
      experienceIndex,
    };
  });
}

function curatedToMerged(items: DynamicResumeCuratedTimelineItem[]): MergedTimelineItem[] {
  return items.map((c) => {
    const sortKeyMs = Date.parse(c.dateISO);
    const safeMs = Number.isNaN(sortKeyMs) ? Date.now() : sortKeyMs;
    return {
      id: `milestone-${c.id}`,
      kind: "milestone",
      sortKeyMs: safeMs,
      title: c.title,
      dateLabel: c.dateISO.slice(0, 10),
      summary: c.summary,
      tags: c.tags,
      experienceIndex: c.experienceIndex,
      media: c.media,
      links: c.links,
    };
  });
}

export function mergeAndSortTimeline(
  resume: ResumeData,
  curated: DynamicResumeCuratedTimelineItem[]
): MergedTimelineItem[] {
  const jobs = jobTimelineItems(resume);
  const milestones = curatedToMerged(curated);
  const combined = [...jobs, ...milestones];
  combined.sort((a, b) => {
    if (b.sortKeyMs !== a.sortKeyMs) return b.sortKeyMs - a.sortKeyMs;
    return b.id.localeCompare(a.id);
  });
  return combined;
}
