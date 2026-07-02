import { ResumeData, ResumeConfig } from '../types/resume';

export interface JobRequirements {
  keywords: string[];
  preferredSkills: string[];
  jobType: 'marketing' | 'technical' | 'management' | 'data-analysis' | 'full-stack';
  experienceLevel: 'entry' | 'mid' | 'senior' | 'executive';
  industry?: string;
}

export interface ResumeCustomization {
  titleBar?: {
    main?: string;
    sub?: string;
  };
  sections?: {
    showTechnicalProficiency?: boolean;
    showCoreCompetencies?: boolean;
    showProfessionalExperience?: boolean;
    showEducation?: boolean;
    showCertifications?: boolean;
  };
  prioritizeExperience?: boolean;
  maxExperienceItems?: number;
  emphasizeSkills?: string[];
}

/**
 * Generate a customized resume based on job requirements
 */
export function generateCustomizedResume(
  baseResumeData: ResumeData,
  jobRequirements: JobRequirements,
  customization: ResumeCustomization = {}
): { resumeData: ResumeData; config: ResumeConfig } {
  
  // Clone the base resume data
  const resumeData: ResumeData = JSON.parse(JSON.stringify(baseResumeData));
  
  // Customize title bar based on job type
  let titleBarMain = customization.titleBar?.main;
  let titleBarSub = customization.titleBar?.sub;
  
  if (!titleBarMain) {
    switch (jobRequirements.jobType) {
      case 'marketing':
        titleBarMain = "Growth Marketing Specialist / Digital Marketing Manager / Performance Marketing";
        break;
      case 'technical':
        titleBarMain = "Technical Project Manager / Full-Stack Developer / Data Engineer";
        break;
      case 'management':
        titleBarMain = "Product Manager / Technical Project Manager / Business Development";
        break;
      case 'data-analysis':
        titleBarMain = "Data Analyst / Business Intelligence / Marketing Data Analysis";
        break;
      default:
        titleBarMain = "Senior Growth Architect & AI Product Lead";
    }
  }
  
  if (!titleBarSub) {
    titleBarSub = "Expertise: Web Engineering • Agentic AI Automation • Full-Stack SEO • Data-Driven GTM";
  }
  
  // Enhanced skill prioritization with scoring (unified skills or legacy competencies)
  if (jobRequirements.keywords.length > 0 || jobRequirements.preferredSkills.length > 0) {
    const allKeywords = [...jobRequirements.keywords, ...jobRequirements.preferredSkills];

    const scoreItem = (text: string) => {
      let score = 0;
      const lower = text.toLowerCase();
      allKeywords.forEach((keyword) => {
        if (lower.includes(keyword.toLowerCase())) {
          score += keyword === keyword.toLowerCase() ? 3 : 2;
        }
      });
      switch (jobRequirements.jobType) {
        case 'marketing':
          if (lower.includes('marketing') || lower.includes('growth') || lower.includes('digital') || lower.includes('performance')) score += 2;
          break;
        case 'technical':
          if (lower.includes('technical') || lower.includes('project') || lower.includes('development') || lower.includes('automation')) score += 2;
          break;
        case 'management':
          if (lower.includes('leadership') || lower.includes('management') || lower.includes('strategic') || lower.includes('business')) score += 2;
          break;
        case 'data-analysis':
          if (lower.includes('analysis') || lower.includes('data') || lower.includes('optimization') || lower.includes('performance')) score += 2;
          break;
      }
      return score;
    };

    if (resumeData.skills?.categories?.length) {
      for (const cat of resumeData.skills.categories) {
        cat.items = cat.items
          .map((item) => ({ item, score: scoreItem(item) }))
          .sort((a, b) => b.score - a.score)
          .map((x) => x.item);
      }
    } else if (resumeData.coreCompetencies?.value?.length) {
      resumeData.coreCompetencies.value = resumeData.coreCompetencies.value
        .map((competency) => ({ competency, score: scoreItem(competency) }))
        .sort((a, b) => b.score - a.score)
        .map((x) => x.competency);
    }
  }
  
  // Limit professional experience if specified
  if (customization.maxExperienceItems && customization.maxExperienceItems < resumeData.professionalExperience.length) {
    resumeData.professionalExperience = resumeData.professionalExperience.slice(0, customization.maxExperienceItems);
  }
  
  // Create config based on customization
  const config: ResumeConfig = {
    titleBar: {
      main: titleBarMain,
      sub: titleBarSub
    },
    sections: {
      showSkills: true,
      showTechnicalProficiency: customization.sections?.showTechnicalProficiency ?? false,
      showCoreCompetencies: customization.sections?.showCoreCompetencies ?? false,
      showProfessionalExperience: customization.sections?.showProfessionalExperience ?? true,
      showEducation: customization.sections?.showEducation ?? true,
      showCertifications: customization.sections?.showCertifications ?? false,
    }
  };
  
  return { resumeData, config };
}

/**
 * Generate a marketing-focused resume
 */
export function generateMarketingResume(baseResumeData: ResumeData): { resumeData: ResumeData; config: ResumeConfig } {
  const jobRequirements: JobRequirements = {
    keywords: ['marketing', 'growth', 'seo', 'digital', 'campaign', 'analytics', 'roi', 'conversion', 'acquisition'],
    preferredSkills: ['Google Analytics', 'SEO', 'SEM', 'Social Media', 'Content Marketing', 'Email Marketing', 'CRM', 'A/B Testing'],
    jobType: 'marketing',
    experienceLevel: 'senior'
  };
  
  const customization: ResumeCustomization = {
    titleBar: {
      main: "Growth Marketing Specialist / Digital Marketing Manager / Performance Marketing Expert",
      sub: "Digital Marketing Strategy | Performance Optimization | Customer Acquisition"
    },
    sections: {
      showTechnicalProficiency: true,
      showCoreCompetencies: true,
      showProfessionalExperience: true,
      showEducation: true,
      showCertifications: true,
    },
    emphasizeSkills: ['Google Analytics', 'Facebook Ads', 'Google Ads', 'SEO', 'SEM', 'Growth Hacking']
  };
  
  return generateCustomizedResume(baseResumeData, jobRequirements, customization);
}

/**
 * Generate a technical-focused resume
 */
export function generateTechnicalResume(baseResumeData: ResumeData): { resumeData: ResumeData; config: ResumeConfig } {
  const jobRequirements: JobRequirements = {
    keywords: ['technical', 'development', 'sql', 'aws', 'python', 'automation', 'api', 'cloud', 'architecture', 'scalability'],
    preferredSkills: ['Python', 'SQL', 'AWS', 'JavaScript', 'API Development', 'Docker', 'Kubernetes', 'CI/CD', 'Git'],
    jobType: 'technical',
    experienceLevel: 'senior'
  };
  
  const customization: ResumeCustomization = {
    titleBar: {
      main: "Senior Technical Project Manager / Full-Stack Developer / Cloud Solutions Architect",
      sub: "Software Development | Cloud Architecture | DevOps & Automation"
    },
    sections: {
      showTechnicalProficiency: true,
      showCoreCompetencies: true,
      showProfessionalExperience: true,
      showEducation: true,
      showCertifications: true,
    },
    emphasizeSkills: ['Python', 'AWS', 'SQL', 'JavaScript', 'Docker', 'API Development']
  };
  
  return generateCustomizedResume(baseResumeData, jobRequirements, customization);
}

/**
 * Generate a data analysis focused resume
 */
export function generateDataAnalysisResume(baseResumeData: ResumeData): { resumeData: ResumeData; config: ResumeConfig } {
  const jobRequirements: JobRequirements = {
    keywords: ['data', 'analysis', 'sql', 'analytics', 'reporting', 'insights', 'visualization', 'dashboard', 'metrics', 'kpi'],
    preferredSkills: ['SQL', 'Python', 'Looker Studio', 'Google Analytics', 'Data Visualization', 'BigQuery', 'Tableau', 'Excel'],
    jobType: 'data-analysis',
    experienceLevel: 'senior'
  };
  
  const customization: ResumeCustomization = {
    titleBar: {
      main: "Senior Data Analyst / Business Intelligence Specialist / Marketing Analytics Expert",
      sub: "Data Analysis | Business Intelligence | Performance Analytics & Insights"
    },
    sections: {
      showTechnicalProficiency: true,
      showCoreCompetencies: true,
      showProfessionalExperience: true,
      showEducation: true,
      showCertifications: true,
    },
    emphasizeSkills: ['SQL', 'Python', 'Looker Studio', 'Google Analytics', 'BigQuery', 'Data Visualization']
  };
  
  return generateCustomizedResume(baseResumeData, jobRequirements, customization);
}

/**
 * Generate a management-focused resume
 */
export function generateManagementResume(baseResumeData: ResumeData): { resumeData: ResumeData; config: ResumeConfig } {
  const jobRequirements: JobRequirements = {
    keywords: ['management', 'leadership', 'project', 'team', 'strategy', 'business'],
    preferredSkills: ['Project Management', 'Team Leadership', 'Strategic Planning', 'Business Development'],
    jobType: 'management',
    experienceLevel: 'executive'
  };
  
  const customization: ResumeCustomization = {
    titleBar: {
      main: "Product Manager / Technical Project Manager / Business Development Manager",
      sub: "Strategic Leadership | Project Management | Business Development"
    },
    sections: {
      showTechnicalProficiency: true,
      showCoreCompetencies: true,
      showProfessionalExperience: true,
      showEducation: true,
      showCertifications: true,
    }
  };
  
  return generateCustomizedResume(baseResumeData, jobRequirements, customization);
} 

// Helper to determine max experience and bullet items based on page count
export function getMaxItemsForPages(targetPages: number) {
  // Example: 2 pages = 5 experience, 10 bullets; 1 page = 2 experience, 6 bullets
  if (targetPages <= 1) return { maxExperience: 2, maxBullets: 6 };
  if (targetPages === 2) return { maxExperience: 5, maxBullets: 10 };
  if (targetPages === 3) return { maxExperience: 8, maxBullets: 16 };
  return { maxExperience: 12, maxBullets: 20 };
} 