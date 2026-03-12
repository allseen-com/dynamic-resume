import { ResumeData, ResumeConfig } from '../types/resume';
import { getWordCountStats } from './wordCountUtils';

export interface PreAnalysisForOptimize {
  matchScore?: number;
  analysis?: string;
  strengths?: string[];
  gaps?: string[];
}

export interface AICustomizationRequest {
  jobDescription: string;
  customPrompt?: string;
  baseResumeData: ResumeData;
  targetRole?: string;
  industry?: string;
  preAnalysis?: PreAnalysisForOptimize;
  onProgress?: (message: string | null) => void;
}

export interface AICustomizationResponse {
  resumeData: ResumeData;
  config: ResumeConfig;
  reasoning?: string;
  companyOrRole?: string; // Added for filename
  matchScore?: number;
  matchScoreAfter?: number;
  groundingVerified?: boolean;
  citations?: { chunkId: string; section: string; score?: number }[];
  optimizationSummary?: string;
  keyChanges?: string[];
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

const POLL_INTERVAL_MS = 1800;
const POLL_TIMEOUT_MS = 120000;

/**
 * Poll optimize-resume status until completed or failed. Returns result or throws.
 * Calls onProgress with statusMessage when status is pending.
 */
async function pollOptimizeStatus(
  jobId: string,
  onProgress?: (message: string | null) => void
): Promise<{
  data: ResumeData;
  matchScore?: number;
  matchScoreAfter?: number;
  groundingVerified?: boolean;
  citations?: { chunkId: string; section: string; score?: number }[];
  optimizationSummary?: string;
  keyChanges?: string[];
}> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await fetch(`/api/optimize-resume/status?jobId=${encodeURIComponent(jobId)}`);
    const body = await res.json();
    if (body.status === 'completed' && body.result?.data) {
      return {
        data: body.result.data,
        matchScore: body.result.matchScore,
        matchScoreAfter: body.result.matchScoreAfter,
        groundingVerified: body.result.groundingVerified,
        citations: body.result.citations,
        optimizationSummary: body.result.optimizationSummary,
        keyChanges: body.result.keyChanges,
      };
    }
    if (body.status === 'failed') {
      throw new Error(body.error || 'Optimization failed');
    }
    if (body.status === 'pending' && onProgress) {
      onProgress(body.statusMessage ?? null);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error('Optimization timed out');
}

/**
 * Call AI service to generate customized resume content (202 + polling).
 */
export async function callAIService(prompt: string, jobDescription: string, resumeData: ResumeData): Promise<ResumeData> {
  try {
    const response = await fetch('/api/optimize-resume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        jobDescription,
        resumeData
      })
    });

    if (response.status === 202) {
      const { jobId } = await response.json();
      if (!jobId) throw new Error('Missing jobId');
      const result = await pollOptimizeStatus(jobId);
      return result.data;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI optimization failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('AI service call failed:', error);
    throw error;
  }
} 

// Extract company or role from job description using regex
function extractCompanyOrRole(jobDescription: string): string | undefined {
  // Try to find patterns like "at {Company}", "with {Company}", "Company: {Company}", etc.
  const companyRegexes = [
    /at ([A-Z][A-Za-z0-9&.,'\- ]{2,})/i,
    /with ([A-Z][A-Za-z0-9&.,'\- ]{2,})/i,
    /company[:\s]+([A-Z][A-Za-z0-9&.,'\- ]{2,})/i,
    /for ([A-Z][A-Za-z0-9&.,'\- ]{2,})/i,
    /([A-Z][A-Za-z0-9&.,'\- ]{2,}) is seeking/i,
    /([A-Z][A-Za-z0-9&.,'\- ]{2,}) seeks/i,
    /([A-Z][A-Za-z0-9&.,'\- ]{2,}) is hiring/i,
    /([A-Z][A-Za-z0-9&.,'\- ]{2,}) has an opening/i
  ];
  for (const regex of companyRegexes) {
    const match = jobDescription.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  // Fallback: try to extract a role/title
  const roleRegex = /(for|as|position:|role:|title:)\s*([A-Za-z0-9&.,'\- ]{2,})/i;
  const roleMatch = jobDescription.match(roleRegex);
  if (roleMatch && roleMatch[2]) {
    return roleMatch[2].trim();
  }
  return undefined;
}

/**
 * Generate an AI-customized resume based on job description
 */
export async function generateAICustomizedResume(
  request: AICustomizationRequest
): Promise<AICustomizationResponse> {
  const { jobDescription, customPrompt, baseResumeData, preAnalysis, onProgress } = request;
  const companyOrRole = extractCompanyOrRole(jobDescription);

  // Get target page count from localStorage if available (default 2)
  let targetPages = 2;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('resumeTargetPages');
    if (stored) targetPages = Number(stored);
  }

  // Add bullet and page count instructions to the prompt
  const bulletInstruction = `\n- Each bullet point must be concise, fit on a single line, and not exceed 50 characters. Do not use ellipsis or truncation.\n- The resume must fit in ${targetPages} A4 pages. Prioritize critical information and summarize or shorten dynamic content as needed.\n`;
  const effectivePrompt = (customPrompt || '') + bulletInstruction;

  try {
    // Call server API (202 + polling) so RAG (Pinecone) and MatchScore run server-side
    const response = await fetch('/api/optimize-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: effectivePrompt,
        jobDescription,
        resumeData: baseResumeData,
        ...(preAnalysis && {
          preAnalysis: {
            matchScore: preAnalysis.matchScore,
            analysis: preAnalysis.analysis,
            strengths: preAnalysis.strengths,
            gaps: preAnalysis.gaps,
          },
        }),
      }),
    });
    if (response.status !== 202) {
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'AI optimization failed');
      }
      const apiResult = await response.json();
      const customizedData = apiResult.data;
      const keywords = extractKeywords(jobDescription);
      const requirements = analyzeRequirements(jobDescription);
      const customizedConfig = generateCustomConfig(keywords, requirements);
      const wordCountStats = getWordCountStats(baseResumeData, customizedData);
      const summaryInfo = `Summary: ${wordCountStats.summary.original}→${wordCountStats.summary.limited} words`;
      const experienceInfo = wordCountStats.experiences.map((exp, i) =>
        `Exp${i+1}: ${exp.original}→${exp.limited} words`
      ).join(', ');
      return {
        resumeData: customizedData,
        config: customizedConfig,
        reasoning: `Resume customized based on job requirements. Word counts: ${summaryInfo}; ${experienceInfo}`,
        companyOrRole,
        matchScore: apiResult.matchScore,
        groundingVerified: apiResult.groundingVerified,
        citations: apiResult.citations,
      };
    }
    const { jobId } = await response.json();
    if (!jobId) throw new Error('Missing jobId');
    const pollResult = await pollOptimizeStatus(jobId, onProgress);
    const customizedData = pollResult.data;
    const keywords = extractKeywords(jobDescription);
    const requirements = analyzeRequirements(jobDescription);
    const customizedConfig = generateCustomConfig(keywords, requirements);
    const wordCountStats = getWordCountStats(baseResumeData, customizedData);
    const summaryInfo = `Summary: ${wordCountStats.summary.original}→${wordCountStats.summary.limited} words`;
    const experienceInfo = wordCountStats.experiences.map((exp, i) =>
      `Exp${i+1}: ${exp.original}→${exp.limited} words`
    ).join(', ');

    return {
      resumeData: customizedData,
      config: customizedConfig,
      reasoning: `Resume customized based on job requirements. Word counts: ${summaryInfo}; ${experienceInfo}`,
      companyOrRole,
      matchScore: pollResult.matchScore,
      matchScoreAfter: pollResult.matchScoreAfter,
      groundingVerified: pollResult.groundingVerified,
      citations: pollResult.citations,
      optimizationSummary: pollResult.optimizationSummary,
      keyChanges: pollResult.keyChanges,
    };
  } catch (error) {
    console.error('AI customization failed, falling back to mock implementation:', error);
    // Fallback to mock implementation if AI service fails
    const keywords = extractKeywords(jobDescription);
    const requirements = analyzeRequirements(jobDescription);
    const customizedData = await customizeResumeData(baseResumeData, keywords, requirements);
    const customizedConfig = generateCustomConfig(keywords, requirements);
    
    // Get word count statistics for reasoning
    const wordCountStats = getWordCountStats(baseResumeData, customizedData);
    const summaryInfo = `Summary: ${wordCountStats.summary.original}→${wordCountStats.summary.limited} words`;
    const experienceInfo = wordCountStats.experiences.map((exp, i) => 
      `Exp${i+1}: ${exp.original}→${exp.limited} words`
    ).join(', ');
    
    return {
      resumeData: customizedData,
      config: customizedConfig,
      reasoning: `Fallback customization based on ${keywords.length} key requirements (AI service unavailable). Word counts: ${summaryInfo}; ${experienceInfo}`,
      companyOrRole // Return extracted value
    };
  }
} 