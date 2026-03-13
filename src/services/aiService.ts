import { ResumeData } from '../types/resume';
import { handleError } from '../utils/errorHandler';
import {
  calculateSummaryWordCount,
  calculateExperienceWordCounts,
  getWordCountStats
} from '../utils/wordCountUtils';

export interface AIProvider {
  name: string;
  generateResponse(prompt: string): Promise<string>;
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'ollama';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

class OpenAIProvider implements AIProvider {
  name = 'OpenAI';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional resume writer and career coach. Your task is to analyze job descriptions and customize resume content to match job requirements while maintaining accuracy and professionalism. Always return valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

class AnthropicProvider implements AIProvider {
  name = 'Anthropic';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-haiku-20240307') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: `You are a professional resume writer and career coach. Your task is to analyze job descriptions and customize resume content to match job requirements while maintaining accuracy and professionalism. Always return valid JSON in the exact format requested.\n\n${prompt}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }
}

class GoogleAIProvider implements AIProvider {
  name = 'Google AI';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional resume writer and career coach. Your task is to analyze job descriptions and customize resume content to match job requirements while maintaining accuracy and professionalism. Always return valid JSON in the exact format requested.\n\n${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Google AI API error: ${response.status} - ${error.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '';
  }
}

class OllamaProvider implements AIProvider {
  name = 'Ollama';
  private baseUrl: string;
  private model: string;

  constructor(baseUrl: string = 'http://localhost:11434', model: string = 'llama3.1:8b') {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        prompt: `You are a professional resume writer and career coach. Your task is to analyze job descriptions and customize resume content to match job requirements while maintaining accuracy and professionalism. Always return valid JSON in the exact format requested.\n\n${prompt}`,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 4000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Ollama API error: ${response.status} - ${error.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.response || '';
  }
}

export class AIService {
  private provider: AIProvider;

  constructor(config: AIServiceConfig) {
    switch (config.provider) {
      case 'openai':
        if (!config.apiKey) {
          throw new Error('OpenAI API key is required');
        }
        this.provider = new OpenAIProvider(config.apiKey, config.model);
        break;
      case 'anthropic':
        if (!config.apiKey) {
          throw new Error('Anthropic API key is required');
        }
        this.provider = new AnthropicProvider(config.apiKey, config.model);
        break;
      case 'google':
        if (!config.apiKey) {
          throw new Error('Google AI API key is required');
        }
        this.provider = new GoogleAIProvider(config.apiKey, config.model);
        break;
      case 'ollama':
        this.provider = new OllamaProvider(config.baseUrl, config.model);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  }

  private getDefaultPrompt(): string {
    return `Analyze the following job description and adapt the resume to match the requirements:

1. **Core Competencies**: Reorder and prioritize skills that match the job requirements. Keep the most relevant skills at the top.

2. **Professional Summary**: Adapt the summary to emphasize experience and skills that align with the job role. Use keywords from the job description naturally.

3. **Technical Skills**: Highlight technologies and tools mentioned in the job description. Prioritize relevant technical skills.

4. **Professional Experience**: Emphasize achievements and responsibilities that are most relevant to the target role.

Focus on:
- Matching keywords naturally
- Highlighting relevant experience
- Maintaining professional tone
- Ensuring ATS compatibility
- Preserving accuracy and truthfulness`;
  }

  private getWordCountConstraints(baseResumeData: ResumeData): string {
    const summaryWordCount = calculateSummaryWordCount(baseResumeData);
    const experienceWordCounts = calculateExperienceWordCounts(baseResumeData);
    
    let constraints = `\nWORD COUNT CONSTRAINTS - STRICTLY FOLLOW THESE LIMITS:\n`;
    constraints += `- Professional Summary: Maximum ${summaryWordCount} words (currently ${summaryWordCount} words)\n`;
    
    if (baseResumeData.professionalExperience && Array.isArray(baseResumeData.professionalExperience)) {
      baseResumeData.professionalExperience.forEach((experience: ResumeData['professionalExperience'][0], index: number) => {
        const currentWordCount = experienceWordCounts[`experience_${index}`] || 0;
        constraints += `- Experience ${index + 1} (${experience.company}): Maximum ${currentWordCount} words (currently ${currentWordCount} words)\n`;
      });
    }
    
    constraints += `\nIMPORTANT: You MUST NOT exceed these word counts for any section. Do NOT truncate. Instead, REWRITE and SUMMARIZE the content so it fits within the word limit while remaining complete and professional. If you exceed the word count, your response will be rejected.\n`;
    constraints += `\nDo not use ellipsis or incomplete sentences. Each section must be a complete, well-written summary within the specified word count.\n`;
    
    return constraints;
  }

  async customizeResume(
    jobDescription: string,
    baseResumeData: ResumeData,
    customPrompt?: string
  ): Promise<ResumeData> {
    const prompt = customPrompt || this.getDefaultPrompt();
    
    // Add word count constraints to the prompt
    const wordCountConstraints = this.getWordCountConstraints(baseResumeData);
    
    const fullPrompt = `${prompt}\n\n${wordCountConstraints}\n\nJob Description:\n${jobDescription}\n\nBase Resume Data:\n${JSON.stringify(baseResumeData, null, 2)}\n\nPlease return ONLY a valid JSON object with the customized resume data. Modify only fields marked with "_dynamic": true. Keep all other fields exactly as they are.`;

    try {
      const response = await this.provider.generateResponse(fullPrompt);
      
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      
      const customizedData = JSON.parse(jsonMatch[0]);
      
      // Validate that the response has the expected structure
      if (!customizedData.header || !customizedData.summary || !customizedData.coreCompetencies) {
        throw new Error('Invalid resume data structure in AI response');
      }
      
      // Check word count limits (no truncation)
      const summaryWordCount = calculateSummaryWordCount(baseResumeData);
      const experienceWordCounts = calculateExperienceWordCounts(baseResumeData);
      const summaryWordCountAI = calculateSummaryWordCount(customizedData);
      if (summaryWordCountAI > summaryWordCount) {
        throw new Error(`AI-generated summary exceeds word count limit (${summaryWordCountAI} > ${summaryWordCount})`);
      }
      const aiExperienceWordCounts = calculateExperienceWordCounts(customizedData);
      for (const key in aiExperienceWordCounts) {
        if (Object.prototype.hasOwnProperty.call(aiExperienceWordCounts, key)) {
          const idx = parseInt(key.split('_')[1], 10);
          const max = experienceWordCounts[key] || 0;
          if (aiExperienceWordCounts[key] > max) {
            throw new Error(`AI-generated experience section ${idx + 1} exceeds word count limit (${aiExperienceWordCounts[key]} > ${max})`);
          }
        }
      }
      
      // Log word count statistics for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        const stats = getWordCountStats(baseResumeData, customizedData);
        console.log('Word count statistics:', stats);
      }
      
      return customizedData as ResumeData;
    } catch (error) {
      const appError = handleError.ai(error);
      throw new Error(appError.userMessage);
    }
  }

  /** Same as customizeResume but asks for a wrapper JSON with resumeData + optimizationSummary + keyChanges. */
  async customizeResumeWithExplanation(
    jobDescription: string,
    baseResumeData: ResumeData,
    customPrompt?: string,
    currentTitleBar?: { main: string; sub: string }
  ): Promise<{ resumeData: ResumeData; optimizationSummary?: string; keyChanges?: string[] }> {
    const prompt = customPrompt || this.getDefaultPrompt();
    const wordCountConstraints = this.getWordCountConstraints(baseResumeData);
    const titleBarBlock = currentTitleBar
      ? `\nCurrent title bar (for reference): main: "${currentTitleBar.main}" | sub: "${currentTitleBar.sub}"\n`
      : '';
    const returnFormat = `Return a single JSON object with exactly these keys:
- "resumeData": the full customized resume in the same JSON structure (modify only "_dynamic": true fields).
- "optimizationSummary": 2-4 sentences on how the resume was tailored and why it is a better match for the role.
- "keyChanges": array of 3-6 bullet strings. Each bullet must name the SECTION (e.g. Summary, Core Competencies, Technical Skills, or Experience at [Company]), WHAT was changed or added, and WHY it improves match to the role (e.g. "Summary: Refocused on growth marketing and SEO to align with JD keywords and role requirements." or "Experience at Red Ventures: Added 2X affiliate revenue metric to highlight quantifiable impact.").`;
    const fullPrompt = `${prompt}\n\n${wordCountConstraints}${titleBarBlock}\n\nJob Description:\n${jobDescription}\n\nBase Resume Data:\n${JSON.stringify(baseResumeData, null, 2)}\n\n${returnFormat}`;

    try {
      const response = await this.provider.generateResponse(fullPrompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }
      const parsed = JSON.parse(jsonMatch[0]) as {
        resumeData?: ResumeData;
        optimizationSummary?: string;
        keyChanges?: string[];
        header?: unknown;
        summary?: unknown;
      };

      let customizedData: ResumeData;
      if (parsed.resumeData && parsed.resumeData.header && parsed.resumeData.summary && parsed.resumeData.coreCompetencies) {
        customizedData = parsed.resumeData as ResumeData;
      } else {
        customizedData = parsed as unknown as ResumeData;
      }

      if (!customizedData.header || !customizedData.summary || !customizedData.coreCompetencies) {
        throw new Error('Invalid resume data structure in AI response');
      }

      const summaryWordCount = calculateSummaryWordCount(baseResumeData);
      const experienceWordCounts = calculateExperienceWordCounts(baseResumeData);
      const summaryWordCountAI = calculateSummaryWordCount(customizedData);
      if (summaryWordCountAI > summaryWordCount) {
        throw new Error(`AI-generated summary exceeds word count limit (${summaryWordCountAI} > ${summaryWordCount})`);
      }
      const aiExperienceWordCounts = calculateExperienceWordCounts(customizedData);
      for (const key in aiExperienceWordCounts) {
        if (Object.prototype.hasOwnProperty.call(aiExperienceWordCounts, key)) {
          const idx = parseInt(key.split('_')[1], 10);
          const max = experienceWordCounts[key] || 0;
          if (aiExperienceWordCounts[key] > max) {
            throw new Error(`AI-generated experience section ${idx + 1} exceeds word count limit (${aiExperienceWordCounts[key]} > ${max})`);
          }
        }
      }

      return {
        resumeData: customizedData,
        optimizationSummary: typeof parsed.optimizationSummary === 'string' ? parsed.optimizationSummary : undefined,
        keyChanges: Array.isArray(parsed.keyChanges) ? parsed.keyChanges.filter((x): x is string => typeof x === 'string') : undefined,
      };
    } catch (error) {
      const appError = handleError.ai(error);
      throw new Error(appError.userMessage);
    }
  }

  getProviderName(): string {
    return this.provider.name;
  }

  /** Generate raw text from a prompt (e.g. for match-score analysis). */
  async generateText(prompt: string): Promise<string> {
    return this.provider.generateResponse(prompt);
  }

  /**
   * Customize a single section; returns a fragment to merge into the working draft.
   * headline -> { titleBar }; summary -> { summary }; technical -> { coreCompetencies, technicalProficiency }; experience -> { professionalExperience }.
   */
  async customizeSection(
    sectionId: 'headline' | 'summary' | 'technical' | 'experience',
    jobDescription: string,
    workingResume: ResumeData,
    sectionPrompt: string,
    ragBlock: string,
    preAnalysisBlock?: string
  ): Promise<SectionFragment> {
    const context = [
      sectionPrompt,
      preAnalysisBlock,
      ragBlock,
      'JOB DESCRIPTION:\n' + jobDescription.slice(0, 6000),
      'CURRENT RESUME (for context):\n' + JSON.stringify(workingResume, null, 2),
    ]
      .filter(Boolean)
      .join('\n\n');

    const fullPrompt = `${context}\n\nReturn ONLY a valid JSON object with the exact structure specified for this section. No other keys, no markdown.`;

    const response = await this.provider.generateResponse(fullPrompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No valid JSON found in AI response for section ${sectionId}`);
    }
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;

    if (sectionId === 'headline') {
      const titleBar = parsed.titleBar as { main?: string; sub?: string } | undefined;
      if (!titleBar || typeof titleBar.main !== 'string') {
        throw new Error('Headline section must return { titleBar: { main, sub } }');
      }
      return { titleBar: { main: titleBar.main, sub: typeof titleBar.sub === 'string' ? titleBar.sub : '' } };
    }
    if (sectionId === 'summary') {
      const summary = parsed.summary as { value?: string } | undefined;
      if (!summary || typeof summary.value !== 'string') {
        throw new Error('Summary section must return { summary: { value } }');
      }
      const baseSummaryWordCount = calculateSummaryWordCount(workingResume);
      const wordCount = summary.value.split(/\s+/).filter(Boolean).length;
      if (wordCount > baseSummaryWordCount) {
        throw new Error(`Summary exceeds word count limit (${wordCount} > ${baseSummaryWordCount})`);
      }
      return { summary: { _dynamic: true, value: summary.value } };
    }
    if (sectionId === 'technical') {
      const coreCompetencies = parsed.coreCompetencies as ResumeData['coreCompetencies'] | undefined;
      const technicalProficiency = parsed.technicalProficiency as ResumeData['technicalProficiency'] | undefined;
      const hasTech = technicalProficiency && (technicalProficiency.categories?.length || (technicalProficiency as { programming?: string[] }).programming !== undefined);
      if (!coreCompetencies?.value || !hasTech) {
        throw new Error('Technical section must return { coreCompetencies, technicalProficiency } with categories or legacy keys');
      }
      return { coreCompetencies, technicalProficiency };
    }
    if (sectionId === 'experience') {
      const professionalExperience = parsed.professionalExperience as ResumeData['professionalExperience'] | undefined;
      if (!Array.isArray(professionalExperience)) {
        throw new Error('Experience section must return { professionalExperience: [...] }');
      }
      const baseExperienceWordCounts = calculateExperienceWordCounts(workingResume);
      const aiCounts = calculateExperienceWordCounts({ ...workingResume, professionalExperience });
      for (const key in aiCounts) {
        const max = baseExperienceWordCounts[key] || 0;
        if (aiCounts[key] > max) {
          throw new Error(`Experience section exceeds word count limit for ${key}`);
        }
      }
      return { professionalExperience };
    }
    throw new Error(`Unknown section: ${sectionId}`);
  }
}

export type SectionFragment =
  | { titleBar: { main: string; sub: string } }
  | { summary: ResumeData['summary'] }
  | { coreCompetencies: ResumeData['coreCompetencies']; technicalProficiency: ResumeData['technicalProficiency'] }
  | { professionalExperience: ResumeData['professionalExperience'] };

// Factory function to create AI service instance
export function createAIService(): AIService {
  const provider = process.env.AI_PROVIDER as AIServiceConfig['provider'] || 'openai';
  const apiKey = getApiKey(provider);
  
  const config: AIServiceConfig = {
    provider,
    apiKey,
    model: getModel(provider),
    baseUrl: provider === 'ollama' ? process.env.OLLAMA_BASE_URL : undefined,
  };

  return new AIService(config);
}

function getApiKey(provider: string): string | undefined {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_API_KEY;
    case 'anthropic':
      return process.env.ANTHROPIC_API_KEY;
    case 'google':
      return process.env.GOOGLE_AI_API_KEY;
    case 'ollama':
      return undefined; // Ollama doesn't require API key
    default:
      return undefined;
  }
}

function getModel(provider: string): string | undefined {
  switch (provider) {
    case 'openai':
      return process.env.OPENAI_MODEL || 'gpt-4o-mini';
    case 'anthropic':
      return process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';
    case 'google':
      return process.env.GOOGLE_AI_MODEL || 'gemini-1.5-flash';
    case 'ollama':
      return process.env.OLLAMA_MODEL || 'llama3.1:8b';
    default:
      return undefined;
  }
} 