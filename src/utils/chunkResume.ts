import { ResumeData } from '../types/resume';

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

  // Core competencies
  if (data.coreCompetencies?.value?.length) {
    const text = data.coreCompetencies.value.join('. ');
    chunks.push({
      id: `chunk-${globalIndex++}`,
      text: `Core Competencies: ${text}`,
      metadata: { section: 'coreCompetencies' },
    });
  }

  // Technical skills (by category)
  if (data.technicalProficiency) {
    const tp = data.technicalProficiency;
    const parts: string[] = [];
    if (tp.categories?.length) {
      for (const g of tp.categories) {
        if (g.items?.length) parts.push(`${g.category}: ${g.items.join(', ')}`);
      }
    } else {
      if (tp.programming?.length) parts.push(`Programming: ${tp.programming.join(', ')}`);
      if (tp.cloudData?.length) parts.push(`Cloud/Data: ${tp.cloudData.join(', ')}`);
      if (tp.analytics?.length) parts.push(`Analytics: ${tp.analytics.join(', ')}`);
      if (tp.mlAi?.length) parts.push(`ML/AI: ${tp.mlAi.join(', ')}`);
      if (tp.productivity?.length) parts.push(`Productivity: ${tp.productivity.join(', ')}`);
      if (tp.marketingAds?.length) parts.push(`Marketing/Ads: ${tp.marketingAds.join(', ')}`);
    }
    if (parts.length) {
      chunks.push({
        id: `chunk-${globalIndex++}`,
        text: `Technical Skills: ${parts.join('. ')}`,
        metadata: { section: 'technicalProficiency' },
      });
    }
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
  if (data.coreCompetencies?.value?.length) {
    parts.push(data.coreCompetencies.value.slice(0, 5).join('. '));
  }
  if (data.professionalExperience?.length) {
    data.professionalExperience.slice(0, 5).forEach((exp) => {
      const firstLine = exp.description?.value?.split(/\n/)[0] ?? '';
      if (firstLine) parts.push(`${exp.company} – ${firstLine}`);
    });
  }
  return parts.join('\n\n');
}
