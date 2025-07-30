import { ResumeTemplate, analyzeContentFit, ContentFitAnalysis } from '../types/template';
import { ResumeData } from '../types/resume';

/**
 * Template-Aware AI Prompt Generation
 * 
 * This system generates AI prompts that understand template constraints
 * and guide content generation to fit within specified page limits.
 */

export interface TemplateAwarePromptConfig {
  template: ResumeTemplate;
  jobDescription: string;
  baseResumeData: ResumeData;
  customInstructions?: string;
}

/**
 * Generate a comprehensive AI prompt that understands template constraints
 */
export function generateTemplateAwarePrompt(config: TemplateAwarePromptConfig): string {
  const { template, baseResumeData, customInstructions } = config;
  
  // Analyze current content fit
  const contentAnalysis = analyzeContentFit(baseResumeData, template);
  
  const basePrompt = `
You are an expert resume writer specializing in creating ATS-optimized resumes that fit precise page constraints.

CRITICAL TEMPLATE CONSTRAINTS - MUST BE FOLLOWED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Template: ${template.name}
Maximum Pages: ${template.constraints.maxPages}
Emphasis: ${template.constraints.layout.emphasizeSection}

WORD LIMITS (STRICTLY ENFORCED):
• Summary: MAX ${template.constraints.wordLimits.summary} words
• Experience per job: MAX ${template.constraints.wordLimits.experiencePerJob} words
• Core competencies total: MAX ${template.constraints.wordLimits.competenciesTotal} words

ITEM LIMITS:
• Core competencies: MAX ${template.constraints.itemLimits.coreCompetencies} items
• Technical skills per category: MAX ${template.constraints.itemLimits.technicalSkillsPerCategory} items
• Experience positions: MAX ${template.constraints.itemLimits.maxExperienceJobs} positions
• Certifications: MAX ${template.constraints.itemLimits.certificationsMax} items

${template.promptInstructions}

OPTIMIZATION STRATEGY:
${generateOptimizationStrategy(template, contentAnalysis)}

CONTENT MODIFICATION RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ONLY modify fields marked with "_dynamic": true
2. NEVER truncate with "..." or similar - content must be complete and meaningful
3. Prioritize job-relevant keywords and achievements
4. Use active voice and quantifiable results
5. Ensure content flows naturally and reads professionally

TEMPLATE-SPECIFIC INSTRUCTIONS:
${getTemplateSpecificInstructions(template)}

${customInstructions ? `\nADDITIONAL INSTRUCTIONS:\n${customInstructions}` : ''}

VALIDATION CHECKLIST:
Before returning, ensure:
✓ All word limits are respected
✓ All item limits are respected  
✓ Content is complete (no truncation)
✓ Job-relevant keywords are naturally incorporated
✓ Professional tone maintained
✓ JSON structure preserved exactly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();

  return basePrompt;
}

/**
 * Generate optimization strategy based on template and current content analysis
 */
function generateOptimizationStrategy(template: ResumeTemplate, analysis: ContentFitAnalysis): string {
  const strategies: string[] = [];
  
  if (template.constraints.layout.emphasizeSection === 'technical') {
    strategies.push('• Prioritize technical achievements and quantifiable system improvements');
    strategies.push('• Highlight programming languages, frameworks, and tools relevant to job');
    strategies.push('• Focus on scalability, performance, and architecture decisions');
  } else if (template.constraints.layout.emphasizeSection === 'experience') {
    strategies.push('• Emphasize leadership, strategic decisions, and business impact');
    strategies.push('• Include comprehensive project outcomes and team achievements');
    strategies.push('• Highlight cross-functional collaboration and stakeholder management');
  } else {
    strategies.push('• Balance technical skills with business impact and leadership');
    strategies.push('• Show progression from individual contributor to strategic roles');
    strategies.push('• Emphasize both technical depth and business acumen');
  }
  
  // Add specific optimization based on content analysis
  if (analysis.violations.length > 0) {
    strategies.push('• Current content exceeds template limits - prioritize most impactful achievements');
    strategies.push('• Focus on recent, relevant experience that matches job requirements');
  }
  
  if (template.constraints.maxPages === 2) {
    strategies.push('• Use concise, high-impact language - every word must add value');
    strategies.push('• Combine related achievements into single, powerful statements');
  } else {
    strategies.push('• Utilize additional space for detailed project descriptions');
    strategies.push('• Include context and background for complex achievements');
  }
  
  return strategies.join('\n');
}

/**
 * Get template-specific instructions for AI
 */
function getTemplateSpecificInstructions(template: ResumeTemplate): string {
  switch (template.id) {
    case 'compact-2page':
      return `
COMPACT 2-PAGE OPTIMIZATION:
• Every bullet point must be under 15 words and highly impactful
• Combine similar achievements into single statements
• Use metrics and percentages to demonstrate value quickly
• Remove redundant qualifiers and focus on outcomes
• Prioritize recent (last 5 years) and most relevant experience
      `.trim();
      
    case 'detailed-3page':
      return `
DETAILED 3-PAGE OPTIMIZATION:
• Include comprehensive project context and challenges overcome
• Add specific methodologies, tools, and processes used
• Describe team sizes, budgets, and stakeholder relationships
• Show progression of responsibilities and scope over time
• Include both tactical execution and strategic thinking
      `.trim();
      
    case 'technical-2page':
      return `
TECHNICAL 2-PAGE OPTIMIZATION:
• Lead with programming languages and technologies from job description
• Quantify technical impact: performance improvements, system scale, uptime
• Emphasize architecture decisions and technical leadership
• Include specific tools, frameworks, and platforms
• Balance individual contributions with team/project outcomes
      `.trim();
      
    default:
      return 'Follow standard optimization practices while respecting template constraints.';
  }
}

/**
 * Create the final prompt with job description and resume data
 */
export function createFinalPrompt(
  basePrompt: string,
  jobDescription: string,
  resumeData: ResumeData
): string {
  return `${basePrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
JOB DESCRIPTION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${jobDescription}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MOTHER RESUME DATA TO OPTIMIZE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${JSON.stringify(resumeData, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RETURN: Optimized resume as valid JSON in exact same structure.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

/**
 * Pre-process resume data to fit template constraints before AI optimization
 */
export function preprocessResumeForTemplate(
  resumeData: ResumeData,
  template: ResumeTemplate
): ResumeData {
  const processed = JSON.parse(JSON.stringify(resumeData)) as ResumeData;
  
  // Limit experience entries
  if (processed.professionalExperience.length > template.constraints.itemLimits.maxExperienceJobs) {
    processed.professionalExperience = processed.professionalExperience
      .slice(0, template.constraints.itemLimits.maxExperienceJobs);
  }
  
  // Limit competencies
  if (processed.coreCompetencies.value.length > template.constraints.itemLimits.coreCompetencies) {
    processed.coreCompetencies.value = processed.coreCompetencies.value
      .slice(0, template.constraints.itemLimits.coreCompetencies);
  }
  
  // Limit certifications  
  if (processed.certifications.value.length > template.constraints.itemLimits.certificationsMax) {
    processed.certifications.value = processed.certifications.value
      .slice(0, template.constraints.itemLimits.certificationsMax);
  }
  
  // Limit technical skills per category
  const techProf = processed.technicalProficiency;
  const maxPerCat = template.constraints.itemLimits.technicalSkillsPerCategory;
  
  techProf.programming = techProf.programming.slice(0, maxPerCat);
  techProf.cloudData = techProf.cloudData.slice(0, maxPerCat);
  techProf.analytics = techProf.analytics.slice(0, maxPerCat);
  techProf.mlAi = techProf.mlAi.slice(0, maxPerCat);
  techProf.productivity = techProf.productivity.slice(0, maxPerCat);
  techProf.marketingAds = techProf.marketingAds.slice(0, maxPerCat);
  
  return processed;
}