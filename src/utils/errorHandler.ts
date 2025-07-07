export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  details?: unknown;
  timestamp: Date;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: AppError[] = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Create a standardized error object
   */
  createError(
    code: string,
    message: string,
    userMessage: string,
    details?: unknown
  ): AppError {
    const error: AppError = {
      code,
      message,
      userMessage,
      details,
      timestamp: new Date()
    };

    this.logError(error);
    return error;
  }

  /**
   * Handle AI service errors
   */
  handleAIError(error: unknown): AppError {
    console.error('AI Service Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return this.createError(
          'AI_API_KEY_ERROR',
          error.message,
          'AI service is not properly configured. Please check your API key settings.',
          error
        );
      }

      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return this.createError(
          'AI_RATE_LIMIT_ERROR',
          error.message,
          'AI service rate limit exceeded. Please try again in a few minutes.',
          error
        );
      }

      if (error.message.includes('timeout')) {
        return this.createError(
          'AI_TIMEOUT_ERROR',
          error.message,
          'AI service request timed out. Please try again.',
          error
        );
      }

      if (error.message.includes('Invalid') || error.message.includes('JSON')) {
        return this.createError(
          'AI_RESPONSE_ERROR',
          error.message,
          'AI service returned an invalid response. Please try again.',
          error
        );
      }

      return this.createError(
        'AI_GENERAL_ERROR',
        error.message,
        'AI service encountered an error. Please try again or use the fallback customization.',
        error
      );
    }

    return this.createError(
      'AI_UNKNOWN_ERROR',
      'Unknown AI service error',
      'An unexpected error occurred with the AI service. Please try again.',
      error
    );
  }

  /**
   * Handle PDF generation errors
   */
  handlePDFError(error: unknown): AppError {
    console.error('PDF Generation Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('font')) {
        return this.createError(
          'PDF_FONT_ERROR',
          error.message,
          'PDF generation failed due to missing fonts. Please contact support.',
          error
        );
      }

      if (error.message.includes('memory') || error.message.includes('size')) {
        return this.createError(
          'PDF_SIZE_ERROR',
          error.message,
          'Resume content is too large for PDF generation. Please reduce content size.',
          error
        );
      }

      return this.createError(
        'PDF_GENERATION_ERROR',
        error.message,
        'Failed to generate PDF. Please try again.',
        error
      );
    }

    return this.createError(
      'PDF_UNKNOWN_ERROR',
      'Unknown PDF generation error',
      'An unexpected error occurred during PDF generation. Please try again.',
      error
    );
  }

  /**
   * Handle URL extraction errors
   */
  handleURLError(error: unknown): AppError {
    console.error('URL Extraction Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Invalid URL')) {
        return this.createError(
          'URL_INVALID_ERROR',
          error.message,
          'Please provide a valid URL starting with http:// or https://',
          error
        );
      }

      if (error.message.includes('timeout')) {
        return this.createError(
          'URL_TIMEOUT_ERROR',
          error.message,
          'Request timed out. The website may be slow or unavailable.',
          error
        );
      }

      if (error.message.includes('Access denied') || error.message.includes('403')) {
        return this.createError(
          'URL_ACCESS_ERROR',
          error.message,
          'Access denied. The website may block automated requests.',
          error
        );
      }

      if (error.message.includes('Not found') || error.message.includes('404')) {
        return this.createError(
          'URL_NOT_FOUND_ERROR',
          error.message,
          'Page not found. Please check the URL and try again.',
          error
        );
      }

      if (error.message.includes('too large')) {
        return this.createError(
          'URL_SIZE_ERROR',
          error.message,
          'The webpage is too large to process. Please try a different URL.',
          error
        );
      }

      return this.createError(
        'URL_EXTRACTION_ERROR',
        error.message,
        'Failed to extract content from URL. Please try pasting the job description directly.',
        error
      );
    }

    return this.createError(
      'URL_UNKNOWN_ERROR',
      'Unknown URL extraction error',
      'An unexpected error occurred. Please try pasting the job description directly.',
      error
    );
  }

  /**
   * Handle network errors
   */
  handleNetworkError(error: unknown): AppError {
    console.error('Network Error:', error);

    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
        return this.createError(
          'NETWORK_ERROR',
          error.message,
          'Network error. Please check your internet connection and try again.',
          error
        );
      }

      if (error.message.includes('CORS')) {
        return this.createError(
          'CORS_ERROR',
          error.message,
          'Cross-origin request blocked. Please try a different approach.',
          error
        );
      }
    }

    return this.createError(
      'NETWORK_UNKNOWN_ERROR',
      'Unknown network error',
      'A network error occurred. Please check your connection and try again.',
      error
    );
  }

  /**
   * Handle validation errors
   */
  handleValidationError(field: string, value: unknown): AppError {
    return this.createError(
      'VALIDATION_ERROR',
      `Validation failed for field: ${field}`,
      `Please provide a valid ${field}.`,
      { field, value }
    );
  }

  /**
   * Handle general application errors
   */
  handleGenericError(error: unknown, context?: string): AppError {
    console.error('Generic Error:', error, context);

    if (error instanceof Error) {
      return this.createError(
        'GENERIC_ERROR',
        `${context ? `${context}: ` : ''}${error.message}`,
        'An unexpected error occurred. Please try again.',
        { error, context }
      );
    }

    return this.createError(
      'UNKNOWN_ERROR',
      `Unknown error${context ? ` in ${context}` : ''}`,
      'An unexpected error occurred. Please try again.',
      { error, context }
    );
  }

  /**
   * Log error to console and internal log
   */
  private logError(error: AppError): void {
    console.error(`[${error.code}] ${error.message}`, {
      userMessage: error.userMessage,
      details: error.details,
      timestamp: error.timestamp
    });

    // Keep only last 100 errors in memory
    this.errorLog.push(error);
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit: number = 10): AppError[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Utility functions for common error scenarios
export const handleError = {
  ai: (error: unknown) => errorHandler.handleAIError(error),
  pdf: (error: unknown) => errorHandler.handlePDFError(error),
  url: (error: unknown) => errorHandler.handleURLError(error),
  network: (error: unknown) => errorHandler.handleNetworkError(error),
  validation: (field: string, value: unknown) => errorHandler.handleValidationError(field, value),
  generic: (error: unknown, context?: string) => errorHandler.handleGenericError(error, context)
};

// React hook for error handling
export function useErrorHandler() {
  const handleErrorWithState = (
    error: unknown,
    setError: (error: string | null) => void,
    type: keyof typeof handleError = 'generic',
    context?: string
  ) => {
    const appError = type === 'validation' 
      ? handleError.validation(context || 'field', error)
      : handleError[type](error);
    
    setError(appError.userMessage);
    return appError;
  };

  return { handleErrorWithState, errorHandler };
} 