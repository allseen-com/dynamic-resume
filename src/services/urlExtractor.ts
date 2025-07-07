export interface URLExtractionResult {
  success: boolean;
  content?: string;
  error?: string;
  metadata?: {
    title?: string;
    company?: string;
    location?: string;
    url: string;
  };
}

export interface URLExtractorConfig {
  timeout?: number;
  userAgent?: string;
  maxContentLength?: number;
}

export class URLExtractor {
  private config: URLExtractorConfig;

  constructor(config: URLExtractorConfig = {}) {
    this.config = {
      timeout: 10000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      maxContentLength: 50000,
      ...config
    };
  }

  async extractJobDescription(url: string): Promise<URLExtractionResult> {
    try {
      // Validate URL
      if (!this.isValidURL(url)) {
        return {
          success: false,
          error: 'Invalid URL format'
        };
      }

      // Check if URL is from a supported job board
      const jobBoard = this.detectJobBoard(url);
      if (!jobBoard) {
        return {
          success: false,
          error: 'Unsupported job board. Please try LinkedIn, Indeed, Glassdoor, or other major job boards.'
        };
      }

      // Fetch content from URL
      const response = await fetch('/api/extract-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: Failed to fetch content`
        };
      }

      const data = await response.json();
      
      if (!data.success) {
        return {
          success: false,
          error: data.error || 'Failed to extract content'
        };
      }

      // Extract job description from HTML content
      const extractedContent = this.extractJobDescriptionFromHTML(data.content, jobBoard);
      
      if (!extractedContent.content || extractedContent.content.trim().length < 100) {
        return {
          success: false,
          error: 'Could not extract meaningful job description content from the page'
        };
      }

      return {
        success: true,
        content: extractedContent.content,
        metadata: {
          ...extractedContent.metadata,
          url
        }
      };

    } catch (error) {
      console.error('URL extraction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private isValidURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private detectJobBoard(url: string): string | null {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('linkedin.com')) return 'linkedin';
    if (urlLower.includes('indeed.com')) return 'indeed';
    if (urlLower.includes('glassdoor.com')) return 'glassdoor';
    if (urlLower.includes('monster.com')) return 'monster';
    if (urlLower.includes('ziprecruiter.com')) return 'ziprecruiter';
    if (urlLower.includes('dice.com')) return 'dice';
    if (urlLower.includes('stackoverflow.com')) return 'stackoverflow';
    if (urlLower.includes('angel.co') || urlLower.includes('wellfound.com')) return 'angellist';
    if (urlLower.includes('jobs.lever.co')) return 'lever';
    if (urlLower.includes('greenhouse.io')) return 'greenhouse';
    if (urlLower.includes('workday.com')) return 'workday';
    if (urlLower.includes('smartrecruiters.com')) return 'smartrecruiters';
    
    return 'generic';
  }

  private extractJobDescriptionFromHTML(html: string, jobBoard: string): {
    content: string;
    metadata: {
      title?: string;
      company?: string;
      location?: string;
    };
  } {
    // Create a DOM parser (this would work in browser environment)
    // For Node.js, we'll use a simplified text extraction approach
    
    const metadata: { title?: string; company?: string; location?: string } = {};
    
    // Remove script and style tags
    let cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    cleanHtml = cleanHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    
    // Extract title
    const titleMatch = cleanHtml.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      metadata.title = this.cleanText(titleMatch[1]);
    }

    // Job board specific extraction
    let content = '';
    
    switch (jobBoard) {
      case 'linkedin':
        content = this.extractLinkedInContent(cleanHtml);
        break;
      case 'indeed':
        content = this.extractIndeedContent(cleanHtml);
        break;
      case 'glassdoor':
        content = this.extractGlassdoorContent(cleanHtml);
        break;
      default:
        content = this.extractGenericContent(cleanHtml);
    }

    return {
      content: this.cleanText(content),
      metadata
    };
  }

  private extractLinkedInContent(html: string): string {
    // Look for LinkedIn job description patterns
    const patterns = [
      /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<section[^>]*class="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
      /<div[^>]*data-test="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
    ];

    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        return this.stripHtmlTags(matches[0]);
      }
    }

    return this.extractGenericContent(html);
  }

  private extractIndeedContent(html: string): string {
    // Look for Indeed job description patterns
    const patterns = [
      /<div[^>]*class="[^"]*jobsearch-jobDescriptionText[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*id="[^"]*jobDescriptionText[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class="[^"]*job_description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
    ];

    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        return this.stripHtmlTags(matches[0]);
      }
    }

    return this.extractGenericContent(html);
  }

  private extractGlassdoorContent(html: string): string {
    // Look for Glassdoor job description patterns
    const patterns = [
      /<div[^>]*class="[^"]*desc[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<section[^>]*class="[^"]*jobDescriptionContent[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
      /<div[^>]*data-test="[^"]*job-description[^"]*"[^>]*>([\s\S]*?)<\/div>/gi
    ];

    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        return this.stripHtmlTags(matches[0]);
      }
    }

    return this.extractGenericContent(html);
  }

  private extractGenericContent(html: string): string {
    // Generic content extraction - look for common job description indicators
    const patterns = [
      // Look for divs/sections with job-related class names
      /<div[^>]*class="[^"]*(?:job|description|content|detail)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<section[^>]*class="[^"]*(?:job|description|content|detail)[^"]*"[^>]*>([\s\S]*?)<\/section>/gi,
      // Look for main content areas
      /<main[^>]*>([\s\S]*?)<\/main>/gi,
      /<article[^>]*>([\s\S]*?)<\/article>/gi,
      // Look for divs with role="main"
      /<div[^>]*role="main"[^>]*>([\s\S]*?)<\/div>/gi
    ];

    for (const pattern of patterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        const content = this.stripHtmlTags(matches[0]);
        if (content.length > 200) { // Only return if substantial content
          return content;
        }
      }
    }

    // Fallback: extract all text content
    return this.stripHtmlTags(html);
  }

  private stripHtmlTags(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }
}

// Factory function to create URL extractor
export function createURLExtractor(config?: URLExtractorConfig): URLExtractor {
  return new URLExtractor(config);
} 