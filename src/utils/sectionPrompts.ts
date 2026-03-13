import { getContextSkyscraperPrefix } from './contextSkyscraper';

/** Section IDs for the section-based prompt flow. Order: headline → summary → technical → experience, then final. */
export const SECTION_IDS = ['headline', 'summary', 'technical', 'experience'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Per-section max word count for optimization. Used to constrain section length. */
export type SectionMaxWordsKey = 'headline' | 'summary' | 'technical' | 'experience' | 'final';
export interface SectionMaxWords {
  headline?: number;
  summary: number;
  technical: number;
  experience: number;
  final: number;
}

export const DEFAULT_SECTION_MAX_WORDS: SectionMaxWords = {
  headline: 20,
  summary: 120,
  technical: 150,
  experience: 600,
  final: 1200,
};

const STORAGE_KEYS_MAX_WORDS: Record<SectionMaxWordsKey, string> = {
  headline: 'sectionMaxWords_headline',
  summary: 'sectionMaxWords_summary',
  technical: 'sectionMaxWords_technical',
  experience: 'sectionMaxWords_experience',
  final: 'sectionMaxWords_final',
};

export function getSectionMaxWords(): SectionMaxWords {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SECTION_MAX_WORDS };
  }
  const out = { ...DEFAULT_SECTION_MAX_WORDS };
  (Object.keys(STORAGE_KEYS_MAX_WORDS) as SectionMaxWordsKey[]).forEach((key) => {
    const stored = localStorage.getItem(STORAGE_KEYS_MAX_WORDS[key]);
    if (stored != null) {
      const n = Number(stored);
      if (!Number.isNaN(n) && n >= 0) out[key] = n;
    }
  });
  return out;
}

export function setSectionMaxWordsValue(key: SectionMaxWordsKey, value: number): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS_MAX_WORDS[key], String(Math.max(0, value)));
}

export interface SectionPrompts {
  headline: string;
  summary: string;
  technical: string;
  experience: string;
  final: string;
}

const SKYSCRAPER = getContextSkyscraperPrefix();

const BASE_CRITICAL = `
**CRITICAL INSTRUCTIONS:**
1. ONLY modify the section(s) you are asked to output.
2. Use only information from the provided Mother Resume and RAG context—never fabricate.
3. Return valid JSON in the exact structure specified for this section.
4. Use natural language; avoid keyword stuffing. Paraphrase and use your own wording; avoid repeating exact phrases from the job description so the resume sounds authentic and not copied.
5. Maintain truthfulness—enhance and rephrase, don't invent.`;

/** Default prompt for the Headline / Title Bar section. Output: { titleBar: { main, sub } } */
const DEFAULT_HEADLINE = `${SKYSCRAPER}${BASE_CRITICAL}

**SECTION: Headline / Title Bar**

Your task is to produce ONLY the title bar (headline) for the resume: a main title and an optional sub-title that position the candidate for the target role.

**Rules:**
- Use the **exact job title** from the job description in the main title where appropriate (Exact Title Rule).
- Main title: one line, 5–12 words, reflecting target role and key qualifications.
- Sub title: optional second line with 2–4 key areas (e.g. "Growth Marketing | Data Strategy | Team Leadership").
- No fabrication—draw from the candidate's real experience in the resume/RAG context.

Return ONLY a JSON object with this exact structure (no other keys):
{
  "titleBar": {
    "main": "Your main headline here",
    "sub": "Area One | Area Two | Area Three"
  }
}`;

/** Default prompt for the Professional Summary section. Output: { summary: { value: string } } */
const DEFAULT_SUMMARY = `${SKYSCRAPER}${BASE_CRITICAL}

**SECTION: Professional Summary**

Your task is to write or adapt ONLY the professional summary paragraph (2–4 sentences) so it aligns with the job description.

**Rules:**
- Length: 80–120 words. Do not exceed this.
- Weave 3–5 key terms from the job description naturally.
- Emphasize experience and achievements most relevant to the target role.
- Use the X-Y-Z style where relevant (action + context + result).
- Professional tone; no first person.
- Use only facts from the Mother Resume and RAG context.

Return ONLY a JSON object with this exact structure (no other keys):
{
  "summary": {
    "value": "Your summary paragraph here."
  }
}`;

/** Default prompt for Core Competencies + Technical Skills. Output: { coreCompetencies, technicalProficiency } */
const DEFAULT_TECHNICAL = `${SKYSCRAPER}${BASE_CRITICAL}

**SECTION: Core Competencies and Technical Skills**

Your task is to produce ONLY the core competencies list and the technical skills categories, tailored to the job description.

**Rules:**
- Core competencies: reorder and optionally rephrase so job-relevant skills are in the top 5. Keep 6–12 items. No fabrication.
- Technical skills: use the "categories" array. For each category, list only technologies/tools from the resume that are relevant to the JD. Preserve the exact category names (e.g. "Languages & Databases", "Cloud & Infrastructure", "AI & ML", "Marketing & Analytics", "Tools & Automation"). Prioritize JD-mentioned technologies. You may omit a category if no items are relevant, or shorten item lists.
- Use exact tool/tech names from the resume where possible; match JD terminology.
- No new skills that don't appear in the source material.

Return ONLY a JSON object with this exact structure (no other keys). Use "categories" with category name and items array:
{
  "coreCompetencies": { "_dynamic": true, "value": ["skill1", "skill2", ...] },
  "technicalProficiency": {
    "_dynamic": true,
    "categories": [
      { "category": "Languages & Databases", "items": [] },
      { "category": "Cloud & Infrastructure", "items": [] },
      { "category": "AI & ML", "items": [] },
      { "category": "Marketing & Analytics", "items": [] },
      { "category": "Tools & Automation", "items": [] }
    ]
  }
}`;

/** Default prompt for Professional Experience. Output: { professionalExperience: [only first 2 entries] }. Older entries are appended from source in code. */
const DEFAULT_EXPERIENCE = `${SKYSCRAPER}${BASE_CRITICAL}

**SECTION: Professional Experience (first two roles only)**

Your task is to produce ONLY the **first two (most recent)** professional experience entries, tailored to the job description. Do **not** include any older roles in your output—they will be appended automatically from the source resume and kept semi-fixed (unchanged by you). Focus roughly 90% of your effort on fully optimizing these two entries. You may reference **all** experience entries in the Mother Resume and RAG (including older roles) when writing the top two.

**Rules for the two entries you output:**
- Use the **exact job title** from the JD where it fits (Exact Title Rule). Entrepreneurial re-labeling: "Founder" / "CEO" may be reframed as "Head of Product" or equivalent if it aligns with the JD and is truthful.
- Preserve each entry’s \`dateRange\` exactly as in the source resume; do not change dates.
- Each role: 5–6 bullets max (use fewer if needed to stay within the HARD LENGTH CONSTRAINT below). Each bullet may be 1–3 lines. \`description.value\` must be newline-separated bullets: "Bullet one.\\nBullet two."
- X-Y-Z form: Action Verb + Skill/Task + Context + Measurable Result. Target 60–70% with a concrete metric (%, $, time, count).
- Use only achievements and facts from the Mother Resume and RAG context; do not invent metrics or roles.

**HARD LENGTH CONSTRAINT:** For each of the two entries at index i (0 and 1), the total word count of \`description.value\` MUST be ≤ the source resume’s word count for that same entry. If the source role is short, use fewer bullets and keep them concise.

Return ONLY a JSON object with this exact structure (no other keys). Include exactly **2** items in the array.
{
  "professionalExperience": [
    {
      "company": "Company Name",
      "_dynamic_company": true,
      "title": "Job Title",
      "_dynamic_title": true,
      "dateRange": "MM/YYYY - MM/YYYY",
      "_dynamic_dateRange": true,
      "description": { "_dynamic": true, "value": "Bullet one.\\nBullet two." }
    },
    {
      "company": "Company Name",
      "_dynamic_company": true,
      "title": "Job Title",
      "_dynamic_title": true,
      "dateRange": "MM/YYYY - MM/YYYY",
      "_dynamic_dateRange": true,
      "description": { "_dynamic": true, "value": "Bullet one.\\nBullet two." }
    }
  ]
}`;

/** Default prompt for the final smoothing pass. Receives merged draft; returns full ResumeData + optimizationSummary + keyChanges. */
const DEFAULT_FINAL = `${SKYSCRAPER}${BASE_CRITICAL}

**FINAL STEP: Smooth and unify the resume**

You are given a draft resume that was built section-by-section (headline, summary, technical skills, experience). Your task is to:
1. Review the full draft for consistency, tone, and flow.
2. Make only minimal edits to smooth transitions, fix redundancy, or align wording—do not rewrite entire sections.
3. Ensure the document reads as one coherent, ATS-friendly resume. Keep wording natural and role-aligned without mirroring the job description verbatim.
4. Preserve all factual content; only refine and polish.
5. Return the complete resume in the exact same JSON structure as the draft, plus a brief optimizationSummary and keyChanges list.

**Output format:** Return ONLY a JSON object with these keys:
- "resumeData": the full resume object (same structure as the draft: header, summary, coreCompetencies, technicalProficiency, professionalExperience, education, certifications).
- "optimizationSummary": 2–4 sentences describing how the resume was tailored and why it is a better match for the role.
- "keyChanges": array of 3–6 short bullet strings. Each bullet names the SECTION, WHAT was changed or added, and WHY it improves match (e.g. "Summary: Refocused on growth marketing and SEO to align with JD keywords.").

Use MM/YYYY for all dates. Do not add or remove sections; only the fields marked _dynamic in the draft may be refined.`;

/** Default section prompts (Skyscraper already included). */
export const DEFAULT_SECTION_PROMPTS: SectionPrompts = {
  headline: DEFAULT_HEADLINE,
  summary: DEFAULT_SUMMARY,
  technical: DEFAULT_TECHNICAL,
  experience: DEFAULT_EXPERIENCE,
  final: DEFAULT_FINAL,
};

const STORAGE_KEYS: Record<keyof SectionPrompts, string> = {
  headline: 'sectionPrompt_headline',
  summary: 'sectionPrompt_summary',
  technical: 'sectionPrompt_technical',
  experience: 'sectionPrompt_experience',
  final: 'sectionPrompt_final',
};

/** Get stored section prompts from localStorage; fall back to defaults. */
export function getSectionPrompts(): SectionPrompts {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_SECTION_PROMPTS };
  }
  const out = { ...DEFAULT_SECTION_PROMPTS };
  (Object.keys(STORAGE_KEYS) as (keyof SectionPrompts)[]).forEach((key) => {
    const stored = localStorage.getItem(STORAGE_KEYS[key]);
    if (stored && stored.trim()) out[key] = stored.trim();
  });
  return out;
}

/** Save a single section prompt to localStorage. */
export function setSectionPrompt(section: keyof SectionPrompts, value: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS[section], value);
}

/** Save all section prompts to localStorage. */
export function setSectionPrompts(prompts: SectionPrompts): void {
  if (typeof window === 'undefined') return;
  (Object.keys(prompts) as (keyof SectionPrompts)[]).forEach((key) => {
    localStorage.setItem(STORAGE_KEYS[key], prompts[key] ?? DEFAULT_SECTION_PROMPTS[key]);
  });
}

/** Get the localStorage key for a section (for Settings UI). */
export function getSectionPromptStorageKey(section: keyof SectionPrompts): string {
  return STORAGE_KEYS[section];
}

/** Reset one section to its default prompt. */
export function getDefaultSectionPrompt(section: keyof SectionPrompts): string {
  return DEFAULT_SECTION_PROMPTS[section];
}
