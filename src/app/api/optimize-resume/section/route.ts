/**
 * POST /api/optimize-resume/section
 * Run optimization for a single section. Returns the fragment (titleBar, summary, coreCompetencies+technicalProficiency, or professionalExperience).
 * Body: { jobDescription, sectionId, sectionPrompts, resumeData, sectionMaxWords?, experiencePrompts? }
 * sectionId may be headline | summary | technical | experience_0 | experience_1 | ...
 */
import { NextRequest, NextResponse } from 'next/server';
import { ResumeData } from '../../../../types/resume';
import { createAIService } from '../../../../services/aiService';
import { isPineconeConfigured, queryResumeChunks } from '../../../../lib/pinecone';
import { embedText } from '../../../../utils/embeddings';
import { normalizeResumeDates } from '../../../../utils/dateFormat';
import type { SectionPrompts, SectionMaxWords } from '../../../../utils/sectionPrompts';
import { SECTION_IDS_BASE, isExperienceSectionId, getExperienceIndexFromSectionId, DEFAULT_EXPERIENCE_SINGLE } from '../../../../utils/sectionPrompts';
import type { SectionFragment } from '../../../../services/aiService';

const RAG_TOP_K = 15;
const SECTION_KEYS: (keyof SectionPrompts)[] = ['headline', 'summary', 'technical', 'experience', 'final'];

function validateSectionPrompts(obj: unknown): obj is SectionPrompts {
  if (!obj || typeof obj !== 'object') return false;
  for (const key of SECTION_KEYS) {
    const v = (obj as Record<string, unknown>)[key];
    if (typeof v !== 'string' || !v.trim()) return false;
  }
  return true;
}

function isValidSectionId(sectionId: string, experienceCount: number): boolean {
  if (SECTION_IDS_BASE.includes(sectionId as (typeof SECTION_IDS_BASE)[number])) return true;
  if (!isExperienceSectionId(sectionId)) return false;
  const idx = getExperienceIndexFromSectionId(sectionId);
  return idx !== null && idx >= 0 && idx < experienceCount;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobDescription,
      sectionId,
      sectionPrompts,
      resumeData: rawResumeData,
      sectionMaxWords,
      experiencePrompts,
    }: {
      jobDescription?: string;
      sectionId?: string;
      sectionPrompts?: unknown;
      resumeData?: ResumeData;
      sectionMaxWords?: SectionMaxWords;
      experiencePrompts?: string[];
    } = body;

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Missing or invalid jobDescription' }, { status: 400 });
    }
    const sectionIdStr = sectionId != null && typeof sectionId === 'string' ? sectionId : null;
    if (!sectionIdStr) {
      return NextResponse.json({ error: 'Missing or invalid sectionId' }, { status: 400 });
    }
    if (!validateSectionPrompts(sectionPrompts)) {
      return NextResponse.json(
        { error: 'Missing or invalid sectionPrompts (headline, summary, technical, experience, final).' },
        { status: 400 }
      );
    }
    if (!rawResumeData || typeof rawResumeData !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid resumeData' }, { status: 400 });
    }

    const resumeData = normalizeResumeDates(rawResumeData) as ResumeData;
    const expCount = Array.isArray(resumeData.professionalExperience) ? resumeData.professionalExperience.length : 0;
    if (!isValidSectionId(sectionIdStr, expCount)) {
      return NextResponse.json(
        { error: `Invalid sectionId. Must be headline, summary, technical, or experience_0 through experience_${Math.max(0, expCount - 1)}` },
        { status: 400 }
      );
    }

    if (!isPineconeConfigured()) {
      return NextResponse.json(
        {
          error:
            'Pinecone RAG is required. Configure PINECONE_API_KEY, PINECONE_INDEX (and optionally PINECONE_NAMESPACE), then index your resume from the Mother Resume page.',
        },
        { status: 503 }
      );
    }
    const jdVector = await embedText(jobDescription.slice(0, 8192));
    const retrieved = await queryResumeChunks(jdVector, RAG_TOP_K);
    if (!retrieved.length) {
      return NextResponse.json(
        { error: 'No resume chunks found. Index your resume from the Mother Resume page first.' },
        { status: 503 }
      );
    }

    const ragBlock = [
      '--- Retrieved resume context (use for grounding) ---',
      ...retrieved.map((r) => `[${r.metadata.section}${r.metadata.company ? ` | ${r.metadata.company}` : ''}] ${r.text.slice(0, 2000)}`),
      '--- End retrieved context ---',
    ].join('\n\n');

    let effectiveSectionPrompt: string;
    const expIdx = getExperienceIndexFromSectionId(sectionIdStr);
    if (expIdx !== null) {
      const promptForIndex = Array.isArray(experiencePrompts) && typeof experiencePrompts[expIdx] === 'string' && experiencePrompts[expIdx].trim()
        ? experiencePrompts[expIdx].trim()
        : DEFAULT_EXPERIENCE_SINGLE;
      const maxWords = sectionMaxWords?.experience;
      const wordLimitLine =
        maxWords != null && maxWords > 0 ? `\n\n**STRICT:** This entry must not exceed ${maxWords} words total for the section; keep this single entry concise.\n\n` : '';
      effectiveSectionPrompt = promptForIndex + wordLimitLine;
    } else {
      const sid = sectionIdStr as 'headline' | 'summary' | 'technical';
      const sectionPrompt = (sectionPrompts as SectionPrompts)[sid];
      const maxWords = sectionMaxWords?.[sid];
      const wordLimitLine =
        maxWords != null && maxWords > 0 ? `\n\n**STRICT:** This section must not exceed ${maxWords} words.\n\n` : '';
      effectiveSectionPrompt = sectionPrompt + wordLimitLine;
    }

    const aiService = createAIService();
    const fragment: SectionFragment = await aiService.customizeSection(
      sectionIdStr,
      jobDescription,
      resumeData,
      effectiveSectionPrompt,
      ragBlock,
      undefined
    );

    return NextResponse.json({ fragment });
  } catch (error) {
    console.error('Single-section optimization failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Section optimization failed' },
      { status: 500 }
    );
  }
}
