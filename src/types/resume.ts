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
    description: string;
  }[];
  education: {
    school: string;
    dateRange: string;
    degree: string;
  }[];
  certifications: string[];
}

export interface ResumeConfig {
  titleBar: {
    main: string;
    sub: string;
  };
  sections: {
    showTechnicalProficiency: boolean;
    showCoreCompetencies: boolean;
    showProfessionalExperience: boolean;
    showEducation: boolean;
    showCertifications: boolean;
  };
}

export const defaultResumeConfig: ResumeConfig = {
  titleBar: {
    main: "Performance Marketing / Marketing Data Analysis / Technical Project Manager",
    sub: "Business Development | Digital Marketing Strategy | Performance Optimizations"
  },
  sections: {
    showTechnicalProficiency: true,
    showCoreCompetencies: true,
    showProfessionalExperience: true,
    showEducation: true,
    showCertifications: true,
  }
}; 