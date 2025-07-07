import { ResumeData, ResumeConfig } from '../types/resume';
import { createAIService } from '../services/aiService';

export interface AICustomizationRequest {
  jobDescription: string;
  customPrompt?: string;
  baseResumeData: ResumeData;
  targetRole?: string;
  industry?: string;
}

export interface AICustomizationResponse {
  resumeData: ResumeData;
  config: ResumeConfig;
  reasoning?: string;
}

/**
 * Generate an AI-customized resume based on job description
 */
export async function generateAICustomizedResume(
  request: AICustomizationRequest
): Promise<AICustomizationResponse> {
  const { jobDescription, customPrompt, baseResumeData } = request;
  
  try {
    // Create AI service instance
    const aiService = createAIService();
    
    // Use real AI service to customize resume
    const customizedData = await aiService.customizeResume(
      jobDescription,
      baseResumeData,
      customPrompt
    );
    
    // Analyze job description for config generation
    const keywords = extractKeywords(jobDescription);
    const requirements = analyzeRequirements(jobDescription);
    const customizedConfig = generateCustomConfig(keywords, requirements);
    
    return {
      resumeData: customizedData,
      config: customizedConfig,
      reasoning: `Resume customized using ${aiService.getProviderName()} based on job requirements`
    };
  } catch (error) {
    console.error('AI customization failed, falling back to mock implementation:', error);
    
    // Fallback to mock implementation if AI service fails
    const keywords = extractKeywords(jobDescription);
    const requirements = analyzeRequirements(jobDescription);
    const customizedData = await customizeResumeData(baseResumeData, keywords, requirements);
    const customizedConfig = generateCustomConfig(keywords, requirements);
    
    return {
      resumeData: customizedData,
      config: customizedConfig,
      reasoning: `Fallback customization based on ${keywords.length} key requirements (AI service unavailable)`
    };
  }
}

/**
 * Extract key terms and technologies from job description
 */
function extractKeywords(jobDescription: string): string[] {
  const text = jobDescription.toLowerCase();
  const keywords: string[] = [];
  
  // Technical skills
  const techKeywords = [
    'python', 'sql', 'javascript', 'react', 'node.js', 'aws', 'docker', 
    'kubernetes', 'git', 'api', 'rest', 'graphql', 'mongodb', 'postgresql',
    'redis', 'elasticsearch', 'kafka', 'jenkins', 'ci/cd', 'devops',
    'machine learning', 'ai', 'data science', 'analytics', 'tableau',
    'power bi', 'looker', 'bigquery', 'spark', 'hadoop', 'tensorflow',
    'pytorch', 'scikit-learn', 'pandas', 'numpy', 'jupyter'
  ];
  
  // Marketing skills
  const marketingKeywords = [
    'seo', 'sem', 'google analytics', 'google ads', 'facebook ads',
    'social media', 'content marketing', 'email marketing', 'crm',
    'hubspot', 'salesforce', 'mailchimp', 'conversion optimization',
    'a/b testing', 'growth hacking', 'lead generation', 'roi',
    'kpi', 'campaign management', 'brand management'
  ];
  
  // Management skills
  const managementKeywords = [
    'project management', 'team leadership', 'agile', 'scrum', 'kanban',
    'stakeholder management', 'budget management', 'strategic planning',
    'cross-functional', 'collaboration', 'communication', 'mentoring',
    'coaching', 'performance management', 'change management'
  ];
  
  const allKeywords = [...techKeywords, ...marketingKeywords, ...managementKeywords];
  
  allKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword);
    }
  });
  
  return keywords;
}

/**
 * Analyze job requirements and categorize them
 */
function analyzeRequirements(jobDescription: string): {
  role: string;
  level: string;
  skills: string[];
  responsibilities: string[];
} {
  const text = jobDescription.toLowerCase();
  
  // Determine role type
  let role = 'general';
  if (text.includes('marketing') || text.includes('growth')) role = 'marketing';
  if (text.includes('engineer') || text.includes('developer') || text.includes('technical')) role = 'technical';
  if (text.includes('data') || text.includes('analyst') || text.includes('analytics')) role = 'data-analysis';
  if (text.includes('manager') || text.includes('lead') || text.includes('director')) role = 'management';
  
  // Determine experience level
  let level = 'mid';
  if (text.includes('senior') || text.includes('lead') || text.includes('principal')) level = 'senior';
  if (text.includes('junior') || text.includes('entry') || text.includes('associate')) level = 'junior';
  if (text.includes('director') || text.includes('vp') || text.includes('head of')) level = 'executive';
  
  return {
    role,
    level,
    skills: extractKeywords(jobDescription),
    responsibilities: []
  };
}

/**
 * Customize resume data based on AI analysis
 */
async function customizeResumeData(
  baseData: ResumeData,
  keywords: string[],
  requirements: { role: string; level: string; skills: string[]; responsibilities: string[] }
): Promise<ResumeData> {
  const customizedData = JSON.parse(JSON.stringify(baseData)) as ResumeData;
  
  // Customize summary if it's dynamic
  if (customizedData.summary._dynamic) {
    customizedData.summary.value = generateCustomSummary(baseData, keywords, requirements);
  }
  
  // Customize core competencies if dynamic
  if (customizedData.coreCompetencies._dynamic) {
    customizedData.coreCompetencies.value = prioritizeCompetencies(
      baseData.coreCompetencies.value,
      keywords
    );
  }
  
  // Note: Professional experience descriptions could be customized here
  // For now, we keep them as-is but this is where AI would enhance descriptions
  
  return customizedData;
}

/**
 * Generate a custom professional summary
 */
function generateCustomSummary(
  baseData: ResumeData,
  keywords: string[],
  requirements: { role: string; level: string; skills: string[]; responsibilities: string[] }
): string {
  
  // Create role-specific summary variations
  const roleIntros = {
    marketing: "Growth marketing and digital strategy executive",
    technical: "Technical project manager and full-stack development professional",
    'data-analysis': "Data-driven analyst and business intelligence specialist",
    management: "Strategic leader and project management executive",
    general: "Versatile professional and strategic contributor"
  };
  
  const intro = roleIntros[requirements.role as keyof typeof roleIntros] || roleIntros.general;
  
  // Add relevant keywords naturally
  const keywordPhrase = keywords.length > 0 
    ? ` with expertise in ${keywords.slice(0, 3).join(', ')}`
    : '';
  
  return `${intro}${keywordPhrase} with 10+ years of experience driving digital transformation and revenue growth across travel tech, media, and e-commerce. Proven track record in managing high-performance teams and executing innovative strategies that consistently deliver measurable results. Analytical, data-driven, and solutions-focused leader passionate about leveraging emerging technologies to enhance business performance and market competitiveness.`;
}

/**
 * Prioritize competencies based on job requirements
 */
function prioritizeCompetencies(
  baseCompetencies: string[],
  keywords: string[]
): string[] {
  const competencies = [...baseCompetencies];
  
  // Score each competency based on keyword matches
  const scoredCompetencies = competencies.map(competency => {
    const lowerCompetency = competency.toLowerCase();
    let score = 0;
    
    keywords.forEach(keyword => {
      if (lowerCompetency.includes(keyword.toLowerCase())) {
        score += 1;
      }
    });
    
    return { competency, score };
  });
  
  // Sort by score (highest first) and return competency strings
  return scoredCompetencies
    .sort((a, b) => b.score - a.score)
    .map(item => item.competency);
}

/**
 * Generate custom configuration based on requirements
 */
function generateCustomConfig(keywords: string[], requirements: { role: string; level: string; skills: string[]; responsibilities: string[] }): ResumeConfig {
  const roleTitles = {
    marketing: "Growth Marketing Specialist / Digital Marketing Manager / Performance Marketing Expert",
    technical: "Technical Project Manager / Full-Stack Developer / Data Engineer",
    'data-analysis': "Data Analyst / Business Intelligence Specialist / Marketing Data Analyst",
    management: "Product Manager / Technical Project Manager / Business Development Manager",
    general: "Performance Marketing / Marketing Data Analysis / Technical Project Manager"
  };
  
  const roleSubtitles = {
    marketing: "Digital Marketing Strategy | Growth Hacking | Performance Optimization",
    technical: "Software Development | Cloud Architecture | Technical Leadership",
    'data-analysis': "Data Analysis | Business Intelligence | Performance Analytics",
    management: "Strategic Leadership | Project Management | Business Development",
    general: "Business Development | Digital Marketing Strategy | Performance Optimizations"
  };
  
  const mainTitle = roleTitles[requirements.role as keyof typeof roleTitles] || roleTitles.general;
  const subtitle = roleSubtitles[requirements.role as keyof typeof roleSubtitles] || roleSubtitles.general;
  
  return {
    titleBar: {
      main: mainTitle,
      sub: subtitle
    },
    sections: {
      showTechnicalProficiency: true,
      showCoreCompetencies: true,
      showProfessionalExperience: true,
      showEducation: true,
      showCertifications: true,
    }
  };
}

/**
 * Call AI service to generate customized resume content
 */
export async function callAIService(prompt: string, jobDescription: string, resumeData: ResumeData): Promise<ResumeData> {
  try {
    const aiService = createAIService();
    return await aiService.customizeResume(jobDescription, resumeData, prompt);
  } catch (error) {
    console.error('AI service call failed:', error);
    throw error;
  }
} 