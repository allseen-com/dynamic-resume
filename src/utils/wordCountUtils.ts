import { ResumeData } from '../types/resume';

/**
 * Utility functions for word count management in resume content
 */

/**
 * Count words in a text string
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  
  // Remove extra whitespace and split by spaces
  const words = text.trim().split(/\s+/);
  
  // Filter out empty strings and count
  return words.filter(word => word.length > 0).length;
}

/**
 * Truncate text to a specific word count while preserving sentence structure
 */
export function truncateToWordCount(text: string, maxWords: number): string {
  if (!text || typeof text !== 'string') return '';
  
  const words = text.trim().split(/\s+/);
  
  if (words.length <= maxWords) {
    return text;
  }
  
  // Take only the first maxWords
  const truncatedWords = words.slice(0, maxWords);
  
  // Join back together
  let result = truncatedWords.join(' ');
  
  // Try to end at a sentence boundary if possible
  const lastSentenceEnd = result.lastIndexOf('.');
  const lastExclamationEnd = result.lastIndexOf('!');
  const lastQuestionEnd = result.lastIndexOf('?');
  
  const lastEnd = Math.max(lastSentenceEnd, lastExclamationEnd, lastQuestionEnd);
  
  if (lastEnd > result.length * 0.7) { // Only truncate if we're not losing too much
    result = result.substring(0, lastEnd + 1);
  }
  
  return result.trim();
}

/**
 * Calculate word count statistics for professional experience descriptions
 */
export function calculateExperienceWordCounts(resumeData: ResumeData): { [key: string]: number } {
  const wordCounts: { [key: string]: number } = {};
  
  if (resumeData.professionalExperience && Array.isArray(resumeData.professionalExperience)) {
    resumeData.professionalExperience.forEach((experience, index) => {
      if (experience.description && experience.description.value) {
        const wordCount = countWords(experience.description.value);
        wordCounts[`experience_${index}`] = wordCount;
      }
    });
  }
  
  return wordCounts;
}

/**
 * Calculate word count for summary
 */
export function calculateSummaryWordCount(resumeData: ResumeData): number {
  if (resumeData.summary && resumeData.summary.value) {
    return countWords(resumeData.summary.value);
  }
  return 0;
}

/**
 * Apply word count limits to AI-generated content
 */
export function applyWordCountLimits(
  originalData: ResumeData,
  generatedData: ResumeData,
  maxMultiplier: number = 1.2 // Allow 20% more words than original
): ResumeData {
  const limitedData: ResumeData = JSON.parse(JSON.stringify(generatedData));
  
  // Limit summary
  if (limitedData.summary && limitedData.summary.value) {
    const originalSummaryCount = calculateSummaryWordCount(originalData);
    const maxSummaryWords = Math.ceil(originalSummaryCount * maxMultiplier);
    
    if (countWords(limitedData.summary.value) > maxSummaryWords) {
      limitedData.summary.value = truncateToWordCount(limitedData.summary.value, maxSummaryWords);
    }
  }
  
  // Limit professional experience descriptions
  if (limitedData.professionalExperience && Array.isArray(limitedData.professionalExperience)) {
    const originalWordCounts = calculateExperienceWordCounts(originalData);
    
    limitedData.professionalExperience.forEach((experience, index) => {
      if (experience.description && experience.description.value) {
        const originalCount = originalWordCounts[`experience_${index}`] || 50; // Default to 50 words
        const maxWords = Math.ceil(originalCount * maxMultiplier);
        
        if (countWords(experience.description.value) > maxWords) {
          experience.description.value = truncateToWordCount(experience.description.value, maxWords);
        }
      }
    });
  }
  
  return limitedData;
}

/**
 * Get word count statistics for debugging
 */
export function getWordCountStats(
  originalData: ResumeData,
  generatedData: ResumeData
): {
  summary: { original: number; generated: number; limited: number };
  experiences: Array<{ original: number; generated: number; limited: number }>;
} {
  const originalSummaryCount = calculateSummaryWordCount(originalData);
  const generatedSummaryCount = calculateSummaryWordCount(generatedData);
  
  const originalWordCounts = calculateExperienceWordCounts(originalData);
  const generatedWordCounts = calculateExperienceWordCounts(generatedData);
  
  const limitedData = applyWordCountLimits(originalData, generatedData);
  const limitedSummaryCount = calculateSummaryWordCount(limitedData);
  const limitedWordCounts = calculateExperienceWordCounts(limitedData);
  
  const experiences = Object.keys(originalWordCounts).map(key => {
    return {
      original: originalWordCounts[key] || 0,
      generated: generatedWordCounts[key] || 0,
      limited: limitedWordCounts[key] || 0
    };
  });
  
  return {
    summary: {
      original: originalSummaryCount,
      generated: generatedSummaryCount,
      limited: limitedSummaryCount
    },
    experiences
  };
} 