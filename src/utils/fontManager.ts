import { Font } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

export interface FontConfig {
  family: string;
  src: string;
  fontWeight?: 'normal' | 'bold' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontStyle?: 'normal' | 'italic';
}

export interface FontVerificationResult {
  isValid: boolean;
  missingFonts: string[];
  availableFonts: string[];
  errors: string[];
}

export class FontManager {
  private static instance: FontManager;
  private isInitialized = false;
  private fontConfigs: FontConfig[] = [];

  private constructor() {}

  static getInstance(): FontManager {
    if (!FontManager.instance) {
      FontManager.instance = new FontManager();
    }
    return FontManager.instance;
  }

  /**
   * Initialize fonts for PDF generation
   */
  async initializeFonts(): Promise<FontVerificationResult> {
    if (this.isInitialized) {
      return this.verifyFonts();
    }

    const result: FontVerificationResult = {
      isValid: true,
      missingFonts: [],
      availableFonts: [],
      errors: []
    };

    try {
      // Define required fonts
      this.fontConfigs = [
        {
          family: 'Lato',
          src: this.getFontPath('Lato-Regular.ttf'),
          fontWeight: 'normal',
          fontStyle: 'normal'
        },
        {
          family: 'Lato',
          src: this.getFontPath('Lato-Bold.ttf'),
          fontWeight: 'bold',
          fontStyle: 'normal'
        },
        {
          family: 'Lato',
          src: this.getFontPath('Lato-Italic.ttf'),
          fontWeight: 'normal',
          fontStyle: 'italic'
        }
      ];

      // Verify fonts exist before registering
      for (const config of this.fontConfigs) {
        try {
          if (fs.existsSync(config.src)) {
            Font.register(config);
            result.availableFonts.push(`${config.family} ${config.fontWeight} ${config.fontStyle}`);
          } else {
            result.missingFonts.push(config.src);
            result.isValid = false;
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Failed to register font ${config.family}: ${errorMessage}`);
          result.isValid = false;
        }
      }

      this.isInitialized = result.isValid;
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Font initialization failed: ${errorMessage}`);
      result.isValid = false;
      return result;
    }
  }

  /**
   * Verify that all required fonts are available
   */
  verifyFonts(): FontVerificationResult {
    const result: FontVerificationResult = {
      isValid: true,
      missingFonts: [],
      availableFonts: [],
      errors: []
    };

    const requiredFonts = [
      'Lato-Regular.ttf',
      'Lato-Bold.ttf',
      'Lato-Italic.ttf'
    ];

    for (const fontFile of requiredFonts) {
      const fontPath = this.getFontPath(fontFile);
      if (fs.existsSync(fontPath)) {
        result.availableFonts.push(fontFile);
      } else {
        result.missingFonts.push(fontFile);
        result.isValid = false;
      }
    }

    return result;
  }

  /**
   * Get the full path to a font file
   */
  private getFontPath(filename: string): string {
    return path.resolve(process.cwd(), 'public', 'fonts', filename);
  }

  /**
   * Get font family name for CSS/styling
   */
  getFontFamily(): string {
    return 'Lato';
  }

  /**
   * Get fallback font families
   */
  getFallbackFonts(): string[] {
    return ['Arial', 'Helvetica', 'sans-serif'];
  }

  /**
   * Get complete font stack for CSS
   */
  getFontStack(): string {
    return `${this.getFontFamily()}, ${this.getFallbackFonts().join(', ')}`;
  }

  /**
   * Reset initialization state (useful for testing)
   */
  reset(): void {
    this.isInitialized = false;
    this.fontConfigs = [];
  }

  /**
   * Check if fonts are initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get detailed font information
   */
  getFontInfo(): {
    isInitialized: boolean;
    fontCount: number;
    fontConfigs: FontConfig[];
  } {
    return {
      isInitialized: this.isInitialized,
      fontCount: this.fontConfigs.length,
      fontConfigs: [...this.fontConfigs]
    };
  }
}

// Export singleton instance
export const fontManager = FontManager.getInstance();

// Utility functions
export async function ensureFontsLoaded(): Promise<FontVerificationResult> {
  return await fontManager.initializeFonts();
}

export function verifyFontAvailability(): FontVerificationResult {
  return fontManager.verifyFonts();
}

export function getFontStack(): string {
  return fontManager.getFontStack();
}

// React hook for font management
export function useFontManager() {
  const initializeFonts = async () => {
    return await fontManager.initializeFonts();
  };

  const verifyFonts = () => {
    return fontManager.verifyFonts();
  };

  const isReady = () => {
    return fontManager.isReady();
  };

  const getFontInfo = () => {
    return fontManager.getFontInfo();
  };

  return {
    initializeFonts,
    verifyFonts,
    isReady,
    getFontInfo,
    fontStack: getFontStack()
  };
} 