import type { ResumeData } from '../types/resume';

export interface SkillCategory {
  category: string;
  items: string[];
}

/** Unified skills categories (new `skills` key or legacy coreCompetencies + technicalProficiency). */
export function getSkillsCategories(data: ResumeData): SkillCategory[] {
  if (data.skills?.categories?.length) {
    return data.skills.categories;
  }

  const categories: SkillCategory[] = [];

  if (data.coreCompetencies?.value?.length) {
    categories.push({
      category: 'Core Competencies',
      items: data.coreCompetencies.value,
    });
  }

  const tech = data.technicalProficiency;
  if (tech?.categories?.length) {
    categories.push(...tech.categories);
  } else if (tech) {
    const legacy = [
      { category: 'Programming', items: tech.programming ?? [] },
      { category: 'Cloud / Data', items: tech.cloudData ?? [] },
      { category: 'Analytics', items: tech.analytics ?? [] },
      { category: 'ML / AI', items: tech.mlAi ?? [] },
      { category: 'Productivity', items: tech.productivity ?? [] },
      { category: 'Marketing / Ads', items: tech.marketingAds ?? [] },
    ].filter((g) => g.items.length > 0);
    categories.push(...legacy);
  }

  return categories;
}

export function getSkillsFootnote(data: ResumeData): string {
  return data.skills?.footnote?.value?.trim() || data.technicalProficiency?.footnote?.value?.trim() || '';
}

export function hasUnifiedSkills(data: ResumeData): boolean {
  return Boolean(data.skills?.categories?.length);
}

export function getSkillsTextForMatch(data: ResumeData): string {
  const parts = getSkillsCategories(data).map((c) => `${c.category}: ${c.items.join(', ')}`);
  const foot = getSkillsFootnote(data);
  if (foot) parts.push(foot);
  return parts.join('. ');
}
