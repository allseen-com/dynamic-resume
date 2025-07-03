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