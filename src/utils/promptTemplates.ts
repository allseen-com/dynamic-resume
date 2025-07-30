export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'general' | 'technical' | 'marketing' | 'management' | 'sales' | 'creative';
}

const BASE_INSTRUCTIONS = `You are an expert resume writer and ATS optimization specialist. Analyze the job description and customize the resume to maximize relevance and ATS compatibility.

**CRITICAL INSTRUCTIONS:**
1. ONLY modify fields marked with "_dynamic": true
2. Preserve all other data exactly as provided
3. Return valid JSON in the exact same structure
4. Use natural language - avoid keyword stuffing
5. Maintain truthfulness - enhance, don't fabricate`;

const BASE_ENDING = `

Job Description:
{JOB_DESCRIPTION}

Base Resume Data:
{RESUME_DATA}

Return the customized resume in the exact same JSON format, modifying only "_dynamic": true fields.`;

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'general',
    name: 'General Purpose',
    description: 'Balanced approach suitable for most job applications',
    category: 'general',
    prompt: `${BASE_INSTRUCTIONS}

**CUSTOMIZATION STRATEGY:**

**Core Competencies (Reorder & Prioritize):**
- Move job-relevant skills to the top 3-5 positions
- Keep skills that match job requirements
- Maintain professional language and avoid duplicates

**Professional Summary (Adapt & Optimize):**
- Incorporate 3-5 key terms from job description naturally
- Emphasize experience most relevant to target role
- Highlight achievements that align with job requirements
- Maintain professional tone and readability
- Keep length between 80-120 words

**Technical Proficiency (Highlight Relevant):**
- Prioritize technologies mentioned in job description
- Group related skills logically
- Ensure mentioned tools/platforms are emphasized

**Professional Experience (Emphasize Relevance):**
- Focus on achievements that match job requirements
- Quantify results where possible
- Use action verbs that align with job description
- Highlight transferable skills for career changes

**Title Bar (Professional Positioning):**
- Create compelling title that reflects target role
- Include 2-3 key qualifications from job description
- Maintain professional credibility

**ATS Optimization:**
- Use exact keywords from job description where appropriate
- Maintain natural language flow
- Ensure proper formatting and structure
- Include industry-standard terminology${BASE_ENDING}`
  },
  {
    id: 'technical',
    name: 'Technical/Engineering',
    description: 'Optimized for software engineering, data science, and technical roles',
    category: 'technical',
    prompt: `${BASE_INSTRUCTIONS}

**TECHNICAL ROLE OPTIMIZATION:**

**Core Competencies (Technical Focus):**
- Prioritize programming languages, frameworks, and tools mentioned in job description
- Group technical skills by category (Languages, Frameworks, Cloud, etc.)
- Highlight problem-solving and analytical skills
- Include relevant methodologies (Agile, DevOps, etc.)

**Professional Summary (Technical Emphasis):**
- Lead with years of technical experience and key technologies
- Mention specific technical achievements or projects
- Include relevant certifications or advanced degrees
- Emphasize problem-solving and innovation capabilities
- Use technical terminology appropriately

**Technical Proficiency (Detailed Technical Skills):**
- Match exact technology stack mentioned in job description
- Prioritize most relevant technologies in each category
- Include version numbers or experience levels where relevant
- Group by: Programming Languages, Frameworks, Cloud/Infrastructure, Databases, Tools

**Professional Experience (Technical Achievements):**
- Quantify technical impact (performance improvements, user growth, etc.)
- Highlight system design and architecture experience
- Mention team collaboration and code review experience
- Include specific technologies used in each role
- Emphasize scalability, optimization, and best practices

**Title Bar (Technical Positioning):**
- Include specific technical role (Senior Software Engineer, Data Scientist, etc.)
- Mention primary technology stack or specialization
- Highlight years of experience or seniority level${BASE_ENDING}`
  },
  {
    id: 'marketing',
    name: 'Marketing/Growth',
    description: 'Tailored for marketing, growth, and digital marketing positions',
    category: 'marketing',
    prompt: `${BASE_INSTRUCTIONS}

**MARKETING ROLE OPTIMIZATION:**

**Core Competencies (Marketing Focus):**
- Prioritize digital marketing channels mentioned in job description
- Highlight data analysis and performance optimization skills
- Include customer acquisition and retention strategies
- Emphasize campaign management and creative strategy

**Professional Summary (Marketing Impact):**
- Lead with measurable marketing achievements (ROI, growth rates, etc.)
- Highlight expertise in relevant marketing channels
- Mention experience with marketing tools and platforms
- Emphasize data-driven decision making
- Include brand management or creative strategy experience

**Technical Proficiency (Marketing Tools & Analytics):**
- Prioritize marketing platforms mentioned in job description
- Group by: Analytics Tools, Advertising Platforms, Marketing Automation, CRM
- Highlight data analysis and reporting capabilities
- Include social media and content management tools

**Professional Experience (Marketing Results):**
- Quantify marketing impact (conversion rates, CTR, ROAS, etc.)
- Highlight successful campaigns and their results
- Mention budget management and resource allocation
- Include cross-functional collaboration with sales, product, etc.
- Emphasize testing, optimization, and continuous improvement

**Title Bar (Marketing Positioning):**
- Include specific marketing specialization (Growth Marketing, Digital Marketing, etc.)
- Mention key channels or expertise areas
- Highlight performance-driven approach${BASE_ENDING}`
  },
  {
    id: 'management',
    name: 'Leadership/Management',
    description: 'Designed for management, leadership, and executive positions',
    category: 'management',
    prompt: `${BASE_INSTRUCTIONS}

**LEADERSHIP ROLE OPTIMIZATION:**

**Core Competencies (Leadership Focus):**
- Prioritize leadership and management skills mentioned in job description
- Highlight strategic planning and business development capabilities
- Include team building and talent development experience
- Emphasize cross-functional collaboration and stakeholder management

**Professional Summary (Leadership Impact):**
- Lead with team size and organizational impact
- Highlight strategic initiatives and business results
- Mention experience in relevant industry or business functions
- Emphasize change management and transformation experience
- Include P&L responsibility or budget management

**Technical Proficiency (Business & Management Tools):**
- Focus on business intelligence and analytics platforms
- Include project management and collaboration tools
- Highlight financial planning and reporting systems
- Mention industry-specific software or platforms

**Professional Experience (Leadership Achievements):**
- Quantify team and business impact (revenue growth, cost savings, etc.)
- Highlight successful team building and talent development
- Mention strategic initiatives and their outcomes
- Include change management and process improvement
- Emphasize stakeholder management and cross-functional leadership

**Title Bar (Executive Positioning):**
- Include leadership level (Director, VP, Senior Manager, etc.)
- Mention functional area or industry expertise
- Highlight strategic and operational capabilities${BASE_ENDING}`
  },
  {
    id: 'sales',
    name: 'Sales/Business Development',
    description: 'Optimized for sales, business development, and revenue-focused roles',
    category: 'sales',
    prompt: `${BASE_INSTRUCTIONS}

**SALES ROLE OPTIMIZATION:**

**Core Competencies (Sales Focus):**
- Prioritize sales methodologies and techniques mentioned in job description
- Highlight customer relationship management and business development skills
- Include negotiation and closing capabilities
- Emphasize market analysis and competitive intelligence

**Professional Summary (Sales Performance):**
- Lead with quantifiable sales achievements (quota attainment, revenue growth, etc.)
- Highlight experience with relevant sales cycles and deal sizes
- Mention industry expertise and customer base
- Emphasize relationship building and account management
- Include territory or market expansion experience

**Technical Proficiency (Sales Tools & CRM):**
- Prioritize CRM and sales enablement tools mentioned in job description
- Include sales analytics and reporting platforms
- Highlight communication and presentation tools
- Mention industry-specific software or platforms

**Professional Experience (Sales Results):**
- Quantify sales performance (quota achievement, revenue generated, etc.)
- Highlight new business acquisition and account growth
- Mention pipeline management and forecasting accuracy
- Include customer retention and upselling success
- Emphasize team collaboration and cross-functional support

**Title Bar (Sales Positioning):**
- Include specific sales role (Account Executive, Business Development, etc.)
- Mention industry or market specialization
- Highlight performance and results orientation${BASE_ENDING}`
  },
  {
    id: 'creative',
    name: 'Creative/Design',
    description: 'Tailored for creative, design, and content creation roles',
    category: 'creative',
    prompt: `${BASE_INSTRUCTIONS}

**CREATIVE ROLE OPTIMIZATION:**

**Core Competencies (Creative Focus):**
- Prioritize design skills and creative software mentioned in job description
- Highlight brand development and visual communication abilities
- Include user experience and design thinking capabilities
- Emphasize project management and client collaboration

**Professional Summary (Creative Impact):**
- Lead with creative achievements and portfolio highlights
- Highlight experience with relevant design disciplines
- Mention brand or client work and recognition
- Emphasize creative problem-solving and innovation
- Include collaboration with cross-functional teams

**Technical Proficiency (Creative Tools & Software):**
- Prioritize design software and platforms mentioned in job description
- Group by: Design Software, Prototyping Tools, Web Technologies, etc.
- Include emerging technologies and platforms
- Highlight technical skills that support creative work

**Professional Experience (Creative Achievements):**
- Highlight successful projects and their impact
- Mention awards, recognition, or portfolio pieces
- Include client satisfaction and project delivery success
- Emphasize creative process and methodology
- Show collaboration with developers, marketers, and stakeholders

**Title Bar (Creative Positioning):**
- Include specific creative discipline (UX Designer, Brand Designer, etc.)
- Mention industry or specialization focus
- Highlight creative and strategic capabilities${BASE_ENDING}`
  }
];

export function getPromptTemplate(id: string): PromptTemplate | undefined {
  return PROMPT_TEMPLATES.find(template => template.id === id);
}

export function getPromptsByCategory(category: PromptTemplate['category']): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(template => template.category === category);
}

export function getDefaultPrompt(): string {
  return getPromptTemplate('general')?.prompt || PROMPT_TEMPLATES[0].prompt;
}

export function getCurrentPrompt(): string {
  if (typeof window !== 'undefined') {
    const customPrompt = localStorage.getItem('customAIPrompt');
    if (customPrompt) {
      return customPrompt;
    }
  }
  return getDefaultPrompt();
} 