/**
 * Template System for Dynamic Resume Generation
 * 
 * This defines the structure for templates that guide AI content generation
 * to ensure resumes fit within specified page limits without truncation.
 */

import { ResumeData } from './resume';

export interface TemplateConstraints {
  /** Maximum number of pages (2 or 3) */
  maxPages: 2 | 3;
  
  /** Maximum word counts for different sections */
  wordLimits: {
    summary: number;
    experiencePerJob: number;
    competenciesTotal: number;
  };
  
  /** Maximum number of items in lists */
  itemLimits: {
    coreCompetencies: number;
    technicalSkillsPerCategory: number;
    maxExperienceJobs: number;
    certificationsMax: number;
  };
  
  /** Layout preferences */
  layout: {
    showTechnicalProficiency: boolean;
    emphasizeSection: 'experience' | 'technical' | 'balanced';
    compactMode: boolean;
  };
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  
  /** Page and content constraints */
  constraints: TemplateConstraints;
  
  /** AI prompt instructions specific to this template */
  promptInstructions: string;
  
  /** Preview/example showing the layout */
  preview?: {
    sections: string[];
    estimatedPageCount: number;
  };
}

// Predefined templates focused on page constraints
export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: 'compact-2page',
    name: 'Compact Professional (2 Pages)',
    description: 'Concise format ideal for most applications. Focuses on key achievements.',
    constraints: {
      maxPages: 2,
      wordLimits: {
        summary: 100,
        experiencePerJob: 120,
        competenciesTotal: 60
      },
      itemLimits: {
        coreCompetencies: 8,
        technicalSkillsPerCategory: 6,
        maxExperienceJobs: 4,
        certificationsMax: 4
      },
      layout: {
        showTechnicalProficiency: true,
        emphasizeSection: 'balanced',
        compactMode: true
      }
    },
    promptInstructions: `
TEMPLATE: Compact Professional (2 Pages)
- Keep content concise and impactful
- Prioritize most relevant achievements
- Use brief, action-oriented bullet points
- Ensure all content fits within 2 A4 pages
- Focus on quantifiable results
    `.trim()
  },
  
  {
    id: 'detailed-3page',
    name: 'Detailed Professional (3 Pages)', 
    description: 'Comprehensive format for senior roles. Allows more detailed experience descriptions.',
    constraints: {
      maxPages: 3,
      wordLimits: {
        summary: 130,
        experiencePerJob: 180,
        competenciesTotal: 80
      },
      itemLimits: {
        coreCompetencies: 10,
        technicalSkillsPerCategory: 8,
        maxExperienceJobs: 5,
        certificationsMax: 6
      },
      layout: {
        showTechnicalProficiency: true,
        emphasizeSection: 'experience',
        compactMode: false
      }
    },
    promptInstructions: `
TEMPLATE: Detailed Professional (3 Pages)
- Provide comprehensive achievement descriptions
- Include specific metrics and outcomes
- Allow for detailed project explanations
- Utilize full 3-page space efficiently
- Emphasize leadership and complex projects
    `.trim()
  },
  
  {
    id: 'technical-2page',
    name: 'Technical Focus (2 Pages)',
    description: 'Emphasizes technical skills and projects. Ideal for engineering roles.',
    constraints: {
      maxPages: 2,
      wordLimits: {
        summary: 90,
        experiencePerJob: 100,
        competenciesTotal: 50
      },
      itemLimits: {
        coreCompetencies: 6,
        technicalSkillsPerCategory: 10,
        maxExperienceJobs: 4,
        certificationsMax: 5
      },
      layout: {
        showTechnicalProficiency: true,
        emphasizeSection: 'technical',
        compactMode: true
      }
    },
    promptInstructions: `
TEMPLATE: Technical Focus (2 Pages)
- Emphasize technical achievements and tools
- Highlight programming languages and frameworks
- Focus on system design and architecture
- Quantify technical impact (performance, scale)
- Keep business context brief but present
    `.trim()
  }
];

export const DEFAULT_TEMPLATE = RESUME_TEMPLATES[0]; // compact-2page

/**
 * Get template by ID with fallback to default
 */
export function getTemplateById(id: string): ResumeTemplate {
  return RESUME_TEMPLATES.find(t => t.id === id) || DEFAULT_TEMPLATE;
}

/**
 * Calculate if content fits within template constraints
 */
export interface ContentFitAnalysis {
  fits: boolean;
  violations: string[];
  recommendations: string[];
}

export function analyzeContentFit(
  resumeData: ResumeData,
  template: ResumeTemplate
): ContentFitAnalysis {
  const violations: string[] = [];
  const recommendations: string[] = [];
  
  // Check word count violations
  const summaryWords = resumeData.summary?.value?.split(' ').length || 0;
  if (summaryWords > template.constraints.wordLimits.summary) {
    violations.push(`Summary exceeds ${template.constraints.wordLimits.summary} words (${summaryWords})`);
    recommendations.push('Condense summary to focus on most impactful achievements');
  }
  
  // Check experience word counts
  if (resumeData.professionalExperience) {
    resumeData.professionalExperience.forEach((exp, i: number) => {
      const expWords = exp.description?.value?.split(' ').length || 0;
      if (expWords > template.constraints.wordLimits.experiencePerJob) {
        violations.push(`Experience ${i+1} exceeds ${template.constraints.wordLimits.experiencePerJob} words (${expWords})`);
        recommendations.push(`Shorten experience ${i+1} description to highlight key achievements`);
      }
    });
  }
  
  // Check competencies count
  const competenciesCount = resumeData.coreCompetencies?.value?.length || 0;
  if (competenciesCount > template.constraints.itemLimits.coreCompetencies) {
    violations.push(`Too many core competencies (${competenciesCount}/${template.constraints.itemLimits.coreCompetencies})`);
    recommendations.push('Select most relevant competencies for the target role');
  }
  
  return {
    fits: violations.length === 0,
    violations,
    recommendations
  };
}