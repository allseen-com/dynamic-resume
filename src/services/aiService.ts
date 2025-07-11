import { ResumeData } from '../types/resume';
import { handleError } from '../utils/errorHandler';

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

  async customizeResume(
    jobDescription: string,
    baseResumeData: ResumeData,
    customPrompt?: string
  ): Promise<ResumeData> {
    const prompt = customPrompt || this.getDefaultPrompt();
    
    const fullPrompt = `${prompt}

Job Description:
${jobDescription}

Base Resume Data:
${JSON.stringify(baseResumeData, null, 2)}

Please return ONLY a valid JSON object with the customized resume data. Modify only fields marked with "_dynamic": true. Keep all other fields exactly as they are.`;

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
      
      return customizedData as ResumeData;
    } catch (error) {
      const appError = handleError.ai(error);
      throw new Error(appError.userMessage);
    }
  }

  private getDefaultPrompt(): string {
    return `Analyze the following job description and adapt the resume to match the requirements:

1. **Core Competencies**: Reorder and prioritize skills that match the job requirements. Keep the most relevant skills at the top.

2. **Professional Summary**: Adapt the summary to emphasize experience and skills that align with the job role. Use keywords from the job description naturally.

3. **Technical Proficiency**: Highlight technologies and tools mentioned in the job description. Prioritize relevant technical skills.

4. **Professional Experience**: Emphasize achievements and responsibilities that are most relevant to the target role.

Focus on:
- Matching keywords naturally
- Highlighting relevant experience
- Maintaining professional tone
- Ensuring ATS compatibility
- Preserving accuracy and truthfulness`;
  }

  getProviderName(): string {
    return this.provider.name;
  }
}

// Factory function to create AI service instance
export function createAIService(): AIService {
  const provider = process.env.AI_PROVIDER as AIServiceConfig['provider'] || 'openai';
  
  const config: AIServiceConfig = {
    provider,
    apiKey: getApiKey(provider),
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