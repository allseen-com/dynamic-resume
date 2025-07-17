# Dynamic Resume App Migration Guide

## Overview

This guide outlines the migration of the Dynamic Resume app from the current Next.js implementation to the Liveblocks Next.js starter kit, implementing an advanced "mother resume" system with AI-powered customization and real-time collaboration features.

## 🎯 Enhanced Migration Goals

- **Mother Resume System**: Comprehensive master resume with all experience details
- **AI-Powered Customization**: Intelligent resume tailoring based on job descriptions
- **Multi-Page Generation**: Create 1, 2, or 3-page versions from mother resume
- **Real-time Collaboration**: Multiple users can edit and customize resumes together
- **ATS Optimization**: Generate keyword-optimized, ATS-friendly PDFs
- **Template System**: Multiple professional templates for different industries

## 📁 Project Structure

```
dynamic-resume/                    # Current app (preserved)
├── src/
├── package.json
└── ...

dynamic-resume-v2/                 # New app (Liveblocks-based)
├── src/
├── package.json
└── ...

liveblocks-boilerplate/            # Liveblocks starter kit (reference)
├── starter-kits/nextjs-starter-kit/
└── ...
```

## 🚀 Phase 1: Setup New Project

### Step 1: Create New Project Directory

```bash
# From the current project root
cd ..
mkdir dynamic-resume-v2
cd dynamic-resume-v2
```

### Step 2: Initialize Liveblocks Starter Kit

```bash
# Clone the starter kit
git clone https://github.com/liveblocks/liveblocks.git temp-liveblocks
cp -r temp-liveblocks/starter-kits/nextjs-starter-kit/* .
rm -rf temp-liveblocks

# Install dependencies
npm install

# Add resume-specific dependencies
npm install @react-pdf/renderer
npm install @types/react-pdf
```

### Step 3: Configure Environment

```bash
# Copy environment template
cp .env.example .env.local

# Add Liveblocks configuration
echo "LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key" >> .env.local
echo "NEXTAUTH_SECRET=your_nextauth_secret" >> .env.local
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
echo "OPENAI_API_KEY=your_openai_api_key" >> .env.local
```

## 🧠 Phase 2: Mother Resume System Architecture

### Step 1: Enhanced Resume Data Structure

**File**: `src/types/resume.ts`
```typescript
// Mother Resume - Complete experience database
export interface MotherResume {
  id: string;
  userId: string;
  metadata: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
    summary: string;
    lastUpdated: Date;
  };
  
  // Complete experience database
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    location: string;
    industry: string;
    technologies: string[];
    achievements: Array<{
      id: string;
      description: string;
      impact: string;
      metrics?: string;
      keywords: string[];
    }>;
    responsibilities: Array<{
      id: string;
      description: string;
      keywords: string[];
    }>;
    projects: Array<{
      id: string;
      name: string;
      description: string;
      technologies: string[];
      impact: string;
      url?: string;
    }>;
  }>;
  
  // Complete skills database
  skills: {
    technical: Array<{
      category: string;
      skills: string[];
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }>;
    soft: string[];
    languages: Array<{
      language: string;
      proficiency: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      url?: string;
    }>;
  };
  
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
    relevantCourses?: string[];
  }>;
  
  // AI customization settings
  aiSettings: {
    preferredStyle: 'technical' | 'creative' | 'executive' | 'academic';
    focusAreas: string[];
    targetIndustries: string[];
    customPrompts: {
      summary: string;
      experience: string;
      skills: string;
    };
  };
}

// Customized resume for specific job
export interface CustomizedResume {
  id: string;
  motherResumeId: string;
  jobDescription: JobDescription;
  settings: {
    pageCount: 1 | 2 | 3;
    template: string;
    focusAreas: string[];
    aiCustomizations: {
      summary: string;
      selectedExperiences: string[];
      selectedSkills: string[];
      customPrompt?: string;
    };
  };
  content: {
    summary: string;
    experience: Array<{
      company: string;
      position: string;
      duration: string;
      achievements: string[];
      keywords: string[];
    }>;
    skills: {
      technical: string[];
      soft: string[];
      highlighted: string[];
    };
    education: Array<{
      institution: string;
      degree: string;
      year: string;
    }>;
  };
  generatedAt: Date;
}

export interface JobDescription {
  id: string;
  text: string;
  url?: string;
  company: string;
  position: string;
  requirements: Array<{
    category: 'required' | 'preferred' | 'bonus';
    skills: string[];
  }>;
  keywords: string[];
  industry: string;
  level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  analysis: {
    technicalFocus: string[];
    softSkills: string[];
    industryKeywords: string[];
    experienceLevel: string;
  };
}
```

### Step 2: AI Customization Service

**File**: `src/services/aiCustomizationService.ts`
```typescript
export class AICustomizationService {
  /**
   * Analyze job description and extract requirements
   */
  async analyzeJobDescription(jobText: string): Promise<JobDescription> {
    // Extract company, position, requirements, keywords
    // Categorize skills by importance
    // Determine experience level and industry focus
  }

  /**
   * Generate customized resume from mother resume
   */
  async customizeResume(
    motherResume: MotherResume,
    jobDescription: JobDescription,
    settings: {
      pageCount: 1 | 2 | 3;
      template: string;
      focusAreas: string[];
    }
  ): Promise<CustomizedResume> {
    // 1. Match experiences to job requirements
    // 2. Select most relevant achievements
    // 3. Prioritize skills based on job keywords
    // 4. Generate tailored summary
    // 5. Optimize for page count
  }

  /**
   * Generate multiple resume versions
   */
  async generateResumeVariants(
    motherResume: MotherResume,
    jobDescription: JobDescription
  ): Promise<{
    onePage: CustomizedResume;
    twoPage: CustomizedResume;
    threePage: CustomizedResume;
  }> {
    // Generate different page count versions
    // Optimize content for each length
  }

  /**
   * Extract and enhance achievements
   */
  async enhanceAchievements(
    achievements: string[],
    jobKeywords: string[]
  ): Promise<string[]> {
    // Rewrite achievements to include relevant keywords
    // Add metrics and impact where possible
  }
}
```

### Step 3: PDF Generation Service

**File**: `src/services/pdfGenerationService.ts`
```typescript
export class PDFGenerationService {
  /**
   * Generate ATS-friendly PDF
   */
  async generatePDF(
    customizedResume: CustomizedResume,
    template: string
  ): Promise<Buffer> {
    // Generate PDF with proper formatting
    // Ensure ATS compatibility
    // Include all relevant keywords
  }

  /**
   * Generate multiple template versions
   */
  async generateMultipleTemplates(
    customizedResume: CustomizedResume
  ): Promise<{
    modern: Buffer;
    classic: Buffer;
    executive: Buffer;
    technical: Buffer;
  }> {
    // Generate different template versions
  }
}
```

## 🎨 Phase 3: UI Components Migration

### Step 1: Mother Resume Editor

**File**: `src/components/MotherResumeEditor/MotherResumeEditor.tsx`
```typescript
export function MotherResumeEditor({ resumeId }: { resumeId: string }) {
  // Collaborative mother resume editing
  // Real-time updates for all experience details
  // Rich text editing for achievements
  // Skill categorization and proficiency levels
  // Project management and impact tracking
}
```

### Step 2: Job Description Analyzer

**File**: `src/components/JobAnalyzer/JobAnalyzer.tsx`
```typescript
export function JobAnalyzer() {
  // Paste job description or URL
  // AI-powered requirement extraction
  // Keyword analysis and categorization
  // Experience matching suggestions
  // Skill gap analysis
}
```

### Step 3: Resume Customization Interface

**File**: `src/components/ResumeCustomizer/ResumeCustomizer.tsx`
```typescript
export function ResumeCustomizer({
  motherResumeId,
  jobDescription
}: {
  motherResumeId: string;
  jobDescription: JobDescription;
}) {
  // Page count selection (1, 2, 3 pages)
  // Template selection
  // Focus area customization
  // AI customization settings
  // Real-time preview
}
```

### Step 4: PDF Preview Component

**File**: `src/components/PDFPreview/PDFPreview.tsx`
```typescript
export function PDFPreview({ 
  customizedResume,
  template 
}: { 
  customizedResume: CustomizedResume;
  template: string;
}) {
  // Real-time PDF preview
  // Template switching
  // ATS compatibility checker
  // Keyword density analysis
}
```

## 📊 Phase 4: Liveblocks Integration

### Step 1: Enhanced Liveblocks Configuration

**File**: `src/liveblocks.config.ts`
```typescript
import { LiveMap, LiveObject } from "@liveblocks/client";
import { MotherResume, CustomizedResume, JobDescription } from "./types/resume";

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null;
      editingSection: string | null;
      selectedTemplate: string | null;
    };
    Storage: {
      motherResumes: LiveMap<string, LiveObject<MotherResume>>;
      customizedResumes: LiveMap<string, LiveObject<CustomizedResume>>;
      jobDescriptions: LiveMap<string, LiveObject<JobDescription>>;
      currentSession: LiveObject<{
        motherResumeId: string | null;
        jobDescriptionId: string | null;
        customizedResumeId: string | null;
        template: string;
        pageCount: 1 | 2 | 3;
      }>;
      aiSettings: LiveObject<{
        customPrompts: {
          summary: string;
          experience: string;
          skills: string;
        };
        focusAreas: string[];
        targetIndustries: string[];
      }>;
    };
    UserMeta: {
      id: string;
      info: {
        name: string;
        avatar: string;
        color: string;
      };
    };
    RoomEvent: {
      type: "MOTHER_RESUME_UPDATED" | "JOB_ANALYZED" | "RESUME_CUSTOMIZED" | "PDF_GENERATED";
      data?: any;
    };
  }
}
```

### Step 2: Resume Dashboard

**File**: `src/app/dashboard/page.tsx`
```typescript
export default function Dashboard() {
  return (
    <div>
      <MotherResumeList />
      <JobDescriptionManager />
      <CustomizedResumeGallery />
      <TemplateLibrary />
      <AISettings />
    </div>
  );
}
```

## 🗂️ Phase 5: Dashboard Components

### Step 1: Mother Resume Management

**File**: `src/components/Dashboard/MotherResumeManager.tsx`
```typescript
export function MotherResumeManager() {
  // List all mother resumes
  // Create new mother resume
  // Edit existing mother resume
  // Collaboration indicators
  // Version history
}
```

### Step 2: Job Description Manager

**File**: `src/components/Dashboard/JobDescriptionManager.tsx`
```typescript
export function JobDescriptionManager() {
  // Saved job descriptions
  // Analysis results
  // Keyword extraction
  // Experience matching
  // Skill gap analysis
}
```

### Step 3: Customized Resume Gallery

**File**: `src/components/Dashboard/CustomizedResumeGallery.tsx`
```typescript
export function CustomizedResumeGallery() {
  // Generated resume versions
  // Template variations
  // Page count options
  // Download options
  // Share settings
}
```

## 🔐 Phase 6: Authentication & Permissions

### Step 1: User Management

**File**: `src/app/dashboard/settings/page.tsx`
```typescript
export default function Settings() {
  return (
    <div>
      <ProfileSettings />
      <MotherResumeSettings />
      <CollaborationSettings />
      <AICustomizationSettings />
      <ExportSettings />
    </div>
  );
}
```

### Step 2: Collaboration Permissions

**File**: `src/utils/permissions.ts`
```typescript
export function canEditMotherResume(userId: string, resumeId: string): boolean {
  // Check user permissions for mother resume editing
}

export function canCustomizeResume(userId: string, motherResumeId: string): boolean {
  // Check permissions for creating customized versions
}

export function canShareResume(userId: string, resumeId: string): boolean {
  // Check sharing permissions
}
```

## 🚀 Phase 7: API Migration

### Step 1: Mother Resume API

**File**: `src/app/api/mother-resume/route.ts`
```typescript
export async function GET(request: Request) {
  // Get mother resume data from Liveblocks
}

export async function POST(request: Request) {
  // Create new mother resume
}

export async function PUT(request: Request) {
  // Update mother resume
}
```

### Step 2: Job Analysis API

**File**: `src/app/api/analyze-job/route.ts`
```typescript
export async function POST(request: Request) {
  // Analyze job description
  // Extract requirements and keywords
  // Match with mother resume
}
```

### Step 3: Resume Customization API

**File**: `src/app/api/customize-resume/route.ts`
```typescript
export async function POST(request: Request) {
  // Generate customized resume
  // Apply AI customization
  // Create multiple versions
}
```

### Step 4: PDF Generation API

**File**: `src/app/api/generate-pdf/route.ts`
```typescript
export async function POST(request: Request) {
  // Generate PDF from customized resume
  // Apply template
  // Ensure ATS compatibility
}
```

## 🎯 Phase 8: Enhanced Feature Migration Checklist

### Mother Resume Features
- [ ] Complete experience database
- [ ] Achievement tracking with metrics
- [ ] Skill categorization and proficiency
- [ ] Project management
- [ ] Education and certifications
- [ ] AI customization settings

### Job Analysis Features
- [ ] Job description parsing
- [ ] Requirement extraction
- [ ] Keyword analysis
- [ ] Experience matching
- [ ] Skill gap analysis
- [ ] Industry classification

### Customization Features
- [ ] Multi-page generation (1, 2, 3 pages)
- [ ] Template selection
- [ ] Focus area customization
- [ ] AI-powered content selection
- [ ] Real-time preview
- [ ] ATS optimization

### Collaboration Features
- [ ] Real-time mother resume editing
- [ ] User presence indicators
- [ ] Document sharing
- [ ] Version history
- [ ] Comment system
- [ ] Export/import functionality

### UI/UX Enhancements
- [ ] Mother resume dashboard
- [ ] Job analysis interface
- [ ] Customization wizard
- [ ] Template gallery
- [ ] PDF preview
- [ ] Settings and preferences

## 🔄 Phase 9: Testing & Validation

### Step 1: Unit Tests
```bash
# Test mother resume functionality
npm run test:mother-resume

# Test AI customization
npm run test:ai-customization

# Test PDF generation
npm run test:pdf-generation

# Test job analysis
npm run test:job-analysis
```

### Step 2: Integration Tests
```bash
# Test Liveblocks integration
npm run test:liveblocks

# Test collaboration features
npm run test:collaboration

# Test AI integration
npm run test:ai-integration
```

### Step 3: User Acceptance Testing
- [ ] Mother resume creation and editing
- [ ] Job description analysis
- [ ] Resume customization
- [ ] Multi-page generation
- [ ] Template application
- [ ] PDF generation and download
- [ ] Real-time collaboration
- [ ] User permissions

## 🚀 Phase 10: Deployment

### Step 1: Environment Setup
```bash
# Production environment variables
LIVEBLOCKS_SECRET_KEY=prod_key
NEXTAUTH_SECRET=prod_secret
NEXTAUTH_URL=https://your-domain.com
OPENAI_API_KEY=prod_openai_key
```

### Step 2: Build and Deploy
```bash
# Build the application
npm run build

# Deploy to Vercel/Netlify
npm run deploy
```

### Step 3: Database Migration
- [ ] Migrate existing resume data to mother resume format
- [ ] Set up Liveblocks rooms for collaboration
- [ ] Configure user permissions
- [ ] Test production environment

## 📋 Enhanced Migration Timeline

### Week 1: Setup & Mother Resume System
- [ ] Set up new project structure
- [ ] Implement mother resume data structure
- [ ] Create mother resume editor
- [ ] Set up Liveblocks configuration
- [ ] Basic authentication

### Week 2: Job Analysis & AI Integration
- [ ] Job description analyzer
- [ ] AI customization service
- [ ] Requirement extraction
- [ ] Experience matching
- [ ] Skill gap analysis

### Week 3: Customization & PDF Generation
- [ ] Resume customization interface
- [ ] Multi-page generation
- [ ] Template system
- [ ] PDF generation service
- [ ] ATS optimization

### Week 4: Collaboration & Polish
- [ ] Real-time collaboration
- [ ] User presence
- [ ] Document sharing
- [ ] Dashboard integration
- [ ] Testing and optimization

## 🎯 Success Metrics

### Technical Metrics
- [ ] Mother resume system functional
- [ ] AI customization working accurately
- [ ] Multi-page generation working
- [ ] Real-time collaboration functional
- [ ] PDF generation performance maintained
- [ ] ATS compatibility verified

### User Experience Metrics
- [ ] Faster resume customization
- [ ] Better collaboration experience
- [ ] Improved job matching accuracy
- [ ] Enhanced template variety
- [ ] Seamless multi-page generation

## 🔧 Development Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Type check
npm run typecheck
```

## 📚 Additional Resources

- [Liveblocks Documentation](https://liveblocks.io/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React PDF Renderer](https://react-pdf.org/)
- [NextAuth.js](https://next-auth.js.org/)
- [OpenAI API](https://platform.openai.com/docs)

## 🆘 Troubleshooting

### Common Issues
1. **Mother resume data structure**: Verify all required fields
2. **AI customization errors**: Check OpenAI API configuration
3. **PDF generation issues**: Verify @react-pdf/renderer setup
4. **Liveblocks connection**: Check environment variables
5. **Real-time sync issues**: Verify room configuration

### Support
- Check Liveblocks documentation
- Review Next.js App Router guides
- Test with minimal examples first
- Use browser dev tools for debugging

---

**Note**: This enhanced migration implements a sophisticated "mother resume" system with AI-powered customization, enabling users to maintain a comprehensive experience database and generate targeted, ATS-optimized resumes for specific job applications. 