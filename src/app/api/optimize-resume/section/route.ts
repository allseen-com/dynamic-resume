/**
 * POST /api/optimize-resume/section
 * Run optimization for a single section. Returns the fragment (titleBar, summary, coreCompetencies+technicalProficiency, or professionalExperience).
 * Body: { jobDescription, sectionId, sectionPrompts, resumeData, sectionMaxWords? }
 */
import { NextRequest, NextResponse } from 'next/server';
import { ResumeData } from '../../../../types/resume';
import { createAIService } from '../../../../services/aiService';
import { isPineconeConfigured, queryResumeChunks } from '../../../../lib/pinecone';
import { embedText } from '../../../../utils/embeddings';
import { normalizeResumeDates } from '../../../../utils/dateFormat';
import type { SectionPrompts, SectionMaxWords } from '../../../../utils/sectionPrompts';
import { SECTION_IDS } from '../../../../utils/sectionPrompts';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobDescription,
      sectionId,
      sectionPrompts,
      resumeData: rawResumeData,
      sectionMaxWords,
    }: {
      jobDescription?: string;
      sectionId?: string;
      sectionPrompts?: unknown;
      resumeData?: ResumeData;
      sectionMaxWords?: SectionMaxWords;
    } = body;

    if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
      return NextResponse.json({ error: 'Missing or invalid jobDescription' }, { status: 400 });
    }
    if (!SECTION_IDS.includes(sectionId as (typeof SECTION_IDS)[number])) {
      return NextResponse.json(
        { error: `Invalid sectionId. Must be one of: ${SECTION_IDS.join(', ')}` },
        { status: 400 }
      );
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

    if (!isPineconeConfigured()) {
      return NextResponse.json(
        {
          error:
            'Pinecone RAG is required. Configure PINECONE_API_KEY, PINECONE_INDEX (and optionally PINECONE_NAMESPACE), then index your resume from the Mother Resume page.',
        },
        { status: 503 }
      );
    }

    const resumeData = normalizeResumeDates(rawResumeData) as ResumeData;
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

    const sid = sectionId as (typeof SECTION_IDS)[number];
    const sectionPrompt = (sectionPrompts as SectionPrompts)[sid];
    const maxWords = sectionMaxWords?.[sid];
    const wordLimitLine =
      maxWords != null && maxWords > 0 ? `\n\n**STRICT:** This section must not exceed ${maxWords} words.\n\n` : '';
    const effectiveSectionPrompt = sectionPrompt + wordLimitLine;

    const aiService = createAIService();
    const fragment: SectionFragment = await aiService.customizeSection(
      sid,
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
