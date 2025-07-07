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
    const prompt = `Analyze this job description and customize the resume to match the requirements while keeping the same JSON structure. Only modify fields marked with "_dynamic": true.`;
    
    return await callAIService(prompt, jobDescription, resumeData);
  } catch (error) {
    console.error('Failed to tailor resume:', error);
    // Return original data if AI service fails
    return resumeData;
  }
} 