import { ResumeData } from '../types/resume';
import { getSkillsCategories, getSkillsFootnote, getSkillsTextForMatch } from './skillsUtils';

export interface ResumeChunk {
  id: string;
  text: string;
  metadata: {
    section: string;
    index?: number;
    company?: string;
    title?: string;
    dateRange?: string;
  };
}

/**
 * Split the Mother Resume into semantic chunks by section for RAG retrieval.
 * Each chunk has an id and metadata for citations.
 */
export function chunkResume(data: ResumeData): ResumeChunk[] {
  const chunks: ResumeChunk[] = [];
  let globalIndex = 0;

  // Summary
  if (data.summary?.value) {
    chunks.push({
      id: `chunk-${globalIndex++}`,
      text: `Professional Summary: ${data.summary.value}`,
      metadata: { section: 'summary' },
    });
  }

  // Skills (unified or legacy)
  const skillCategories = getSkillsCategories(data);
  if (skillCategories.length) {
    const parts = skillCategories.map((g) => `${g.category}: ${g.items.join(', ')}`);
    const foot = getSkillsFootnote(data);
    const skillsBody = `Skills: ${parts.join('. ')}${foot ? `. Note: ${foot}` : ''}`;
    chunks.push({
      id: `chunk-${globalIndex++}`,
      text: skillsBody,
      metadata: { section: 'skills' },
    });
  }

  // Professional experience - one chunk per role for fine-grained retrieval
  if (data.professionalExperience?.length) {
    data.professionalExperience.forEach((exp, idx) => {
      const header = [exp.company, exp.title, exp.dateRange].filter(Boolean).join(' | ');
      chunks.push({
        id: `chunk-${globalIndex++}`,
        text: `Experience: ${header}\n\n${exp.description?.value ?? ''}`,
        metadata: {
          section: 'professionalExperience',
          index: idx,
          company: exp.company,
          title: exp.title,
          dateRange: exp.dateRange,
        },
      });
    });
  }

  // Education
  if (data.education?.value?.length) {
    const text = data.education.value
      .map((e) => `${e.school} (${e.dateRange}): ${e.degree}`)
      .join('. ');
    chunks.push({
      id: `chunk-${globalIndex++}`,
      text: `Education: ${text}`,
      metadata: { section: 'education' },
    });
  }

  // Certifications
  if (data.certifications?.value?.length) {
    chunks.push({
      id: `chunk-${globalIndex++}`,
      text: `Certifications: ${data.certifications.value.join('. ')}`,
      metadata: { section: 'certifications' },
    });
  }

  return chunks;
}

/**
 * Build a single "resume summary" text for MatchScore (embedding vs JD).
 * Uses summary + first line of each experience for a compact representation.
 */
export function getResumeSummaryForMatch(data: ResumeData): string {
  const parts: string[] = [];
  if (data.summary?.value) parts.push(data.summary.value);
  const skillsText = getSkillsTextForMatch(data);
  if (skillsText) parts.push(skillsText);
  if (data.professionalExperience?.length) {
    data.professionalExperience.slice(0, 5).forEach((exp) => {
      const firstLine = exp.description?.value?.split(/\n/)[0] ?? '';
      if (firstLine) parts.push(`${exp.company} – ${firstLine}`);
    });
  }
  return parts.join('\n\n');
}
