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
        titleBarMain = "Performance Marketing / Marketing Data Analysis / Technical Project Manager";
    }
  }
  
  if (!titleBarSub) {
    titleBarSub = "Business Development | Digital Marketing Strategy | Performance Optimizations";
  }
  
  // Filter and prioritize core competencies based on job requirements
  if (jobRequirements.keywords.length > 0) {
    const prioritizedCompetencies = resumeData.coreCompetencies.filter(competency =>
      jobRequirements.keywords.some(keyword => 
        competency.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    const otherCompetencies = resumeData.coreCompetencies.filter(competency =>
      !jobRequirements.keywords.some(keyword => 
        competency.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    
    resumeData.coreCompetencies = [...prioritizedCompetencies, ...otherCompetencies];
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
      showTechnicalProficiency: customization.sections?.showTechnicalProficiency ?? true,
      showCoreCompetencies: customization.sections?.showCoreCompetencies ?? true,
      showProfessionalExperience: customization.sections?.showProfessionalExperience ?? true,
      showEducation: customization.sections?.showEducation ?? true,
      showCertifications: customization.sections?.showCertifications ?? true,
    }
  };
  
  return { resumeData, config };
}

/**
 * Generate a marketing-focused resume
 */
export function generateMarketingResume(baseResumeData: ResumeData): { resumeData: ResumeData; config: ResumeConfig } {
  const jobRequirements: JobRequirements = {
    keywords: ['marketing', 'growth', 'seo', 'digital', 'campaign', 'analytics'],
    preferredSkills: ['Google Analytics', 'SEO', 'SEM', 'Social Media', 'Content Marketing'],
    jobType: 'marketing',
    experienceLevel: 'senior'
  };
  
  const customization: ResumeCustomization = {
    titleBar: {
      main: "Growth Marketing Specialist / Digital Marketing Manager / SEO Expert",
      sub: "Digital Marketing Strategy | Performance Marketing | Growth Hacking"
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

/**
 * Generate a technical-focused resume
 */
export function generateTechnicalResume(baseResumeData: ResumeData): { resumeData: ResumeData; config: ResumeConfig } {
  const jobRequirements: JobRequirements = {
    keywords: ['technical', 'development', 'sql', 'aws', 'python', 'automation'],
    preferredSkills: ['Python', 'SQL', 'AWS', 'JavaScript', 'API Development'],
    jobType: 'technical',
    experienceLevel: 'senior'
  };
  
  const customization: ResumeCustomization = {
    titleBar: {
      main: "Technical Project Manager / Full-Stack Developer / Data Engineer",
      sub: "Software Development | Cloud Architecture | Technical Leadership"
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

/**
 * Generate a data analysis focused resume
 */
export function generateDataAnalysisResume(baseResumeData: ResumeData): { resumeData: ResumeData; config: ResumeConfig } {
  const jobRequirements: JobRequirements = {
    keywords: ['data', 'analysis', 'sql', 'analytics', 'reporting', 'insights'],
    preferredSkills: ['SQL', 'Python', 'Looker', 'Google Analytics', 'Data Visualization'],
    jobType: 'data-analysis',
    experienceLevel: 'senior'
  };
  
  const customization: ResumeCustomization = {
    titleBar: {
      main: "Data Analyst / Business Intelligence Specialist / Marketing Data Analysis",
      sub: "Data Analysis | Business Intelligence | Performance Analytics"
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