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
  
  // Enhanced competency prioritization with scoring
  if (jobRequirements.keywords.length > 0 || jobRequirements.preferredSkills.length > 0) {
    const allKeywords = [...jobRequirements.keywords, ...jobRequirements.preferredSkills];
    
    const scoredCompetencies = resumeData.coreCompetencies.value.map(competency => {
      let score = 0;
      const competencyLower = competency.toLowerCase();
      
      // Score based on exact keyword matches
      allKeywords.forEach(keyword => {
        if (competencyLower.includes(keyword.toLowerCase())) {
          score += keyword === keyword.toLowerCase() ? 3 : 2; // Prefer exact case matches
        }
      });
      
      // Bonus for job type specific competencies
      switch (jobRequirements.jobType) {
        case 'marketing':
          if (competencyLower.includes('marketing') || competencyLower.includes('growth') || 
              competencyLower.includes('digital') || competencyLower.includes('performance')) {
            score += 2;
          }
          break;
        case 'technical':
          if (competencyLower.includes('technical') || competencyLower.includes('project') || 
              competencyLower.includes('development') || competencyLower.includes('automation')) {
            score += 2;
          }
          break;
        case 'management':
          if (competencyLower.includes('leadership') || competencyLower.includes('management') || 
              competencyLower.includes('strategic') || competencyLower.includes('business')) {
            score += 2;
          }
          break;
        case 'data-analysis':
          if (competencyLower.includes('analysis') || competencyLower.includes('data') || 
              competencyLower.includes('optimization') || competencyLower.includes('performance')) {
            score += 2;
          }
          break;
      }
      
      return { competency, score };
    });
    
    // Sort by score (highest first) and extract competencies
    resumeData.coreCompetencies.value = scoredCompetencies
      .sort((a, b) => b.score - a.score)
      .map(item => item.competency);
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