export interface ResumeData {
  /**
   * Optional identity cluster (main title + specialization bar).
   * When set, UI/PDF merge this over defaultResumeConfig.titleBar.
   */
  titleBar?: {
    main: string;
    sub: string;
  };
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
  /** Technical skills by category. Display label: "Technical Skills". */
  technicalProficiency: {
    _dynamic?: boolean;
    /** Optional one-liner under Technical Skills (e.g. AI-assisted workflow disclosure). */
    footnote?: {
      _dynamic?: boolean;
      value: string;
    };
    categories: { category: string; items: string[] }[];
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

/** Response from AI customization; matchScore and groundingVerified when Pinecone RAG is used */
export interface AICustomizationResponseMeta {
  matchScore?: number;
  groundingVerified?: boolean;
  citations?: { chunkId: string; section: string; score?: number }[];
}

export const defaultResumeConfig: ResumeConfig = {
  titleBar: {
    main: "Senior Growth Architect & AI Product Lead",
    sub: "Expertise: Web Engineering • Agentic AI Automation • Full-Stack SEO • Data-Driven GTM"
  },
  sections: {
    showTechnicalProficiency: true,
    showCoreCompetencies: true,
    showProfessionalExperience: true,
    showEducation: true,
    showCertifications: true,
  }
};

/** Prefer titleBar from mother resume JSON when present. */
export function resumeConfigWithDataTitleBar(
  data: ResumeData,
  base: ResumeConfig = defaultResumeConfig
): ResumeConfig {
  const tb = data.titleBar;
  if (tb?.main) {
    return {
      ...base,
      titleBar: {
        main: tb.main,
        sub: tb.sub ?? base.titleBar.sub,
      },
    };
  }
  return base;
}
