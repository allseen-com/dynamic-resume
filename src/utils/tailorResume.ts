import resumeData from '../../data/resume.json';

export interface ResumeData {
  header: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  summary: string;
  coreCompetencies: string[];
  technicalProficiency: {
    programming: string[];
    cloudData: string[];
    analytics: string[];
    mlAi: string[];
    productivity: string[];
    marketingAds: string[];
  };
  professionalExperience: {
    company: string;
    title: string;
    dateRange: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    dateRange: string;
    degree: string;
  }[];
  certifications: string[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function tailorResumeForJD(_jobDescription: string): ResumeData {
  // TODO: Integrate AI endpoint
  return resumeData;
} 