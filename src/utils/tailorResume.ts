import resumeData from '../../data/resume.json';

export interface ResumeData {
  header: {
    _dynamic: boolean;
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  summary: {
    _dynamic: boolean;
    value: string;
  };
  coreCompetencies: {
    _dynamic: boolean;
    value: string[];
  };
  technicalProficiency: {
    _dynamic: boolean;
    programming: string[];
    cloudData: string[];
    analytics: string[];
    mlAi: string[];
    productivity: string[];
    marketingAds: string[];
  };
  professionalExperience: {
    company: string;
    _dynamic_company: boolean;
    title: string;
    _dynamic_title: boolean;
    dateRange: string;
    _dynamic_dateRange: boolean;
    description: {
      _dynamic: boolean;
      value: string;
    };
  }[];
  education: {
    _dynamic: boolean;
    value: {
      school: string;
      dateRange: string;
      degree: string;
    }[];
  };
  certifications: {
    _dynamic: boolean;
    value: string[];
  };
}

export async function tailorResumeForJD(jobDescription: string): Promise<ResumeData> {
  try {
    const { callAIService } = await import('./aiResumeGenerator');
    const { getSectionPrompts, DEFAULT_SECTION_PROMPTS } = await import('./sectionPrompts');
    const sectionPrompts = typeof window !== 'undefined' ? getSectionPrompts() : DEFAULT_SECTION_PROMPTS;
    return await callAIService(sectionPrompts, jobDescription, resumeData);
  } catch (error) {
    console.error('Failed to tailor resume:', error);
    return resumeData;
  }
} 