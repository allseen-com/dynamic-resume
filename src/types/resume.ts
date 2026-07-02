export interface ResumeSkills {
  _dynamic?: boolean;
  footnote?: {
    _dynamic?: boolean;
    value: string;
  };
  categories: { category: string; items: string[] }[];
}

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
    links?: {
      linkedin?: string;
      website?: string;
      portfolio?: string;
    };
  };
  summary: {
    _dynamic: boolean;
    value: string;
  };
  /** Unified skills section (replaces coreCompetencies + technicalProficiency). */
  skills?: ResumeSkills;
  /** @deprecated Use `skills` — kept for legacy customized resumes. */
  coreCompetencies?: {
    _dynamic: boolean;
    value: string[];
  };
  /** @deprecated Use `skills` — kept for legacy customized resumes. */
  technicalProficiency?: {
    _dynamic?: boolean;
    footnote?: {
      _dynamic?: boolean;
      value: string;
    };
    categories?: { category: string; items: string[] }[];
    programming?: string[];
    cloudData?: string[];
    analytics?: string[];
    mlAi?: string[];
    productivity?: string[];
    marketingAds?: string[];
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
  /** @deprecated Removed from mother resume — optional for legacy customized resumes. */
  certifications?: {
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
    showSkills: boolean;
    /** @deprecated Use showSkills */
    showCoreCompetencies: boolean;
    /** @deprecated Use showSkills */
    showTechnicalProficiency: boolean;
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
    showSkills: true,
    showCoreCompetencies: false,
    showTechnicalProficiency: false,
    showProfessionalExperience: true,
    showEducation: true,
    showCertifications: false,
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

/** Whether the skills section should render for this resume + config. */
export function shouldShowSkills(config: ResumeConfig, data: ResumeData): boolean {
  if (config.sections.showSkills) return true;
  if (config.sections.showCoreCompetencies || config.sections.showTechnicalProficiency) {
    return Boolean(
      data.skills?.categories?.length ||
        data.coreCompetencies?.value?.length ||
        data.technicalProficiency?.categories?.length
    );
  }
  return false;
}
