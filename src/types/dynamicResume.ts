export interface DynamicResumeMeta {
  tagline: string;
  lastUpdated?: string;
}

export interface DynamicResumeCaseStudy {
  id: string;
  title: string;
  excerpt: string;
  href: string;
  thumbnailUrl?: string;
  tags?: string[];
  /** 0-based index into `professionalExperience` for traceability */
  experienceIndex?: number;
}

export interface DynamicResumeMedia {
  kind: "image" | "video";
  url: string;
  alt?: string;
  caption?: string;
}

export interface DynamicResumeTimelineLink {
  label: string;
  href: string;
}

export interface DynamicResumeCuratedTimelineItem {
  id: string;
  dateISO: string;
  title: string;
  summary: string;
  tags?: string[];
  experienceIndex?: number;
  media?: DynamicResumeMedia[];
  links?: DynamicResumeTimelineLink[];
}

export interface DynamicResumeBundle {
  meta: DynamicResumeMeta;
  caseStudies: DynamicResumeCaseStudy[];
  curatedTimeline: DynamicResumeCuratedTimelineItem[];
}

export type MergedTimelineKind = "role" | "milestone";

/** Unified item for rendering after merge + sort */
export interface MergedTimelineItem {
  id: string;
  kind: MergedTimelineKind;
  sortKeyMs: number;
  title: string;
  subtitle?: string;
  dateLabel: string;
  summary: string;
  tags?: string[];
  experienceIndex?: number;
  media?: DynamicResumeMedia[];
  links?: DynamicResumeTimelineLink[];
}
