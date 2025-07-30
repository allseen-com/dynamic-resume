import { ResumeData } from '../types/resume';
import { ResumeTemplate, analyzeContentFit, ContentFitAnalysis } from '../types/template';
import { AIService, AIServiceConfig } from './aiService';

/**
 * Template-Aware AI Service
 * 
 * Extends the base AI service with template-specific optimization
 * capabilities that ensure content fits within page constraints.
 */

export interface TemplateOptimizationRequest {
  jobDescription: string;
  baseResumeData: ResumeData;
  template: ResumeTemplate;
  customInstructions?: string;
}

export interface TemplateOptimizationResponse {
  optimizedResume: ResumeData;
  template: ResumeTemplate;
  contentAnalysis: {
    beforeOptimization: ContentFitAnalysis;
    afterOptimization: ContentFitAnalysis;
    improvements: string[];
  };
  reasoning: string;
}

export class TemplateAwareAIService extends AIService {
  
  /**
   * Optimize resume for specific template constraints
   */
  async optimizeForTemplate(request: TemplateOptimizationRequest): Promise<TemplateOptimizationResponse> {
    const { jobDescription, baseResumeData, template, customInstructions } = request;
    
    // Analyze content fit before optimization
    const beforeAnalysis = analyzeContentFit(baseResumeData, template);
    
    // Create template-aware prompt
    const prompt = this.createTemplateAwarePrompt(template, jobDescription, customInstructions);
    
    try {
      // Use base AI service for optimization
      const optimizedResume = await this.customizeResume(jobDescription, baseResumeData, prompt);
      
      // Analyze content fit after optimization
      const afterAnalysis = analyzeContentFit(optimizedResume, template);
      
      // Generate improvement summary
      const improvements = this.generateImprovementSummary(beforeAnalysis, afterAnalysis);
      
      // Validate final result
      if (!afterAnalysis.fits) {
        console.warn('Optimized resume still doesn\'t fit template constraints:', afterAnalysis.violations);
        // Could implement retry logic here with more aggressive constraints
      }
      
      return {
        optimizedResume,
        template,
        contentAnalysis: {
          beforeOptimization: beforeAnalysis,
          afterOptimization: afterAnalysis,
          improvements
        },
        reasoning: `Resume optimized for ${template.name} template. ${improvements.length} improvements made.`
      };
      
    } catch (error) {
      console.error('Template-aware optimization failed:', error);
      throw new Error(`Template optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a comprehensive template-aware prompt
   */
  private createTemplateAwarePrompt(
    template: ResumeTemplate,
    jobDescription: string,
    customInstructions?: string
  ): string {
    const basePrompt = `You are an expert resume writer specializing in creating optimized resumes that fit precise template constraints.

TEMPLATE: ${template.name}
CONSTRAINTS: ${template.constraints.maxPages} pages maximum

CRITICAL LIMITS (MUST NOT EXCEED):
• Summary: ${template.constraints.wordLimits.summary} words maximum
• Experience per job: ${template.constraints.wordLimits.experiencePerJob} words maximum  
• Core competencies: ${template.constraints.itemLimits.coreCompetencies} items maximum
• Technical skills per category: ${template.constraints.itemLimits.technicalSkillsPerCategory} items maximum

TEMPLATE INSTRUCTIONS:
${template.promptInstructions}

OPTIMIZATION STRATEGY:
${this.getOptimizationStrategy(template)}

QUALITY REQUIREMENTS:
1. ONLY modify fields marked with "_dynamic": true
2. Content must be complete and meaningful - NO truncation with "..." 
3. Prioritize job-relevant keywords and achievements
4. Maintain professional tone and readability
5. Use quantifiable results where possible
6. Ensure content flows naturally

${customInstructions ? `\nADDITIONAL REQUIREMENTS:\n${customInstructions}` : ''}

VALIDATION CHECKLIST:
✓ All word limits respected
✓ All item limits respected
✓ Content is complete and professional
✓ Job-relevant keywords incorporated naturally
✓ JSON structure preserved exactly`;

    return basePrompt;
  }

  /**
   * Get optimization strategy based on template type
   */
  private getOptimizationStrategy(template: ResumeTemplate): string {
    const strategies: string[] = [];
    
    // Base strategies for all templates
    strategies.push('• Extract key requirements from job description and match with relevant experience');
    strategies.push('• Prioritize recent, relevant achievements that demonstrate job-required skills');
    
    // Template-specific strategies
    switch (template.constraints.layout.emphasizeSection) {
      case 'technical':
        strategies.push('• Highlight technical achievements, programming languages, and system design decisions');
        strategies.push('• Quantify technical impact: performance improvements, scale, reliability metrics');
        strategies.push('• Balance individual technical contributions with team leadership and mentoring');
        break;
        
      case 'experience':
        strategies.push('• Emphasize leadership, strategic thinking, and cross-functional collaboration');
        strategies.push('• Include comprehensive project outcomes and business impact');
        strategies.push('• Highlight team management, stakeholder relations, and process improvements');
        break;
        
      default: // balanced
        strategies.push('• Balance technical expertise with business acumen and leadership skills');
        strategies.push('• Show career progression from technical contributor to strategic roles');
        strategies.push('• Demonstrate both hands-on capability and strategic thinking');
    }
    
    // Page-specific strategies
    if (template.constraints.maxPages === 2) {
      strategies.push('• Use concise, high-impact language - maximize value per word');
      strategies.push('• Combine related achievements into powerful, comprehensive statements');
    } else {
      strategies.push('• Provide detailed context and comprehensive project descriptions');
      strategies.push('• Include methodologies, challenges overcome, and lessons learned');
    }
    
    return strategies.join('\n');
  }

  /**
   * Generate improvement summary comparing before/after analysis
   */
  private generateImprovementSummary(before: ContentFitAnalysis, after: ContentFitAnalysis): string[] {
    const improvements: string[] = [];
    
    // Check if violations were resolved
    const resolvedViolations = before.violations.filter(
      (violation: string) => !after.violations.includes(violation)
    );
    
    resolvedViolations.forEach((resolved: string) => {
      improvements.push(`Resolved: ${resolved}`);
    });
    
    // Check if content now fits
    if (!before.fits && after.fits) {
      improvements.push('Content now fits within template constraints');
    }
    
    // Add general improvements
    if (improvements.length === 0 && after.fits) {
      improvements.push('Content optimized and validated against template constraints');
    }
    
    return improvements;
  }

  /**
   * Batch optimize multiple resumes for different templates
   */
  async batchOptimize(
    jobDescription: string,
    baseResumeData: ResumeData,
    templates: ResumeTemplate[]
  ): Promise<TemplateOptimizationResponse[]> {
    const results: TemplateOptimizationResponse[] = [];
    
    for (const template of templates) {
      try {
        const result = await this.optimizeForTemplate({
          jobDescription,
          baseResumeData,
          template
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to optimize for template ${template.id}:`, error);
        // Could add error result to maintain array consistency
      }
    }
    
    return results;
  }
}

/**
 * Create template-aware AI service instance with configuration
 */
export function createTemplateAwareAIService(config?: AIServiceConfig): TemplateAwareAIService {
  // Use environment variables or defaults
  const finalConfig: AIServiceConfig = config || {
    provider: (process.env.NEXT_PUBLIC_AI_PROVIDER as 'openai' | 'anthropic' | 'google' | 'ollama') || 'openai',
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
    model: process.env.NEXT_PUBLIC_AI_MODEL,
    baseUrl: process.env.NEXT_PUBLIC_AI_BASE_URL
  };
  
  return new TemplateAwareAIService(finalConfig);
}

/**
 * Simplified function for quick template optimization
 */
export async function optimizeResumeForTemplate(
  jobDescription: string,
  baseResumeData: ResumeData,
  template: ResumeTemplate,
  customInstructions?: string
): Promise<ResumeData> {
  const aiService = createTemplateAwareAIService();
  
  const result = await aiService.optimizeForTemplate({
    jobDescription,
    baseResumeData,
    template,
    customInstructions
  });
  
  return result.optimizedResume;
}