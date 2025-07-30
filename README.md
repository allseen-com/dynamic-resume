# Dynamic Resume - AI-Powered Resume Optimization

**Version 0.1.0** - A streamlined Next.js application that generates **AI-optimized, ATS-friendly PDF resumes** with intelligent template-aware content adaptation based on job descriptions.

## 🚀 Key Features

- **🎯 One-Page Optimization Hub**: Streamlined interface for quick resume optimization
- **🤖 Template-Aware AI**: Smart optimization that respects template constraints and page limits
- **📄 Job Description Analysis**: Paste job descriptions to automatically tailor your resume
- **📋 Multiple Resume Templates**: Choose from professional templates with different layouts and constraints
- **📱 Real-time Preview**: See your optimized resume update live as you make changes
- **📄 ATS-Friendly PDF Generation**: Uses `@react-pdf/renderer` for optimal ATS compatibility
- **🗂️ Resume Archive**: Save and manage multiple optimized versions
- **⚡ Modern UI**: Clean, minimal design with consistent color scheme and typography

## 🎯 How It Works

### 1. **Main Optimization Hub** (`/`)
Our redesigned homepage provides a complete optimization workflow:
- **Step 1**: Paste job description text
- **Step 2**: Select from available resume templates (2-3 page options)
- **Step 3**: AI optimization with real-time feedback
- **Step 4**: Save to archive and download PDF

### 2. **Template System**
Choose from professionally designed templates:
- **Professional Template**: 2-page format emphasizing experience
- **Technical Template**: 2-page format highlighting technical skills
- **Compact Template**: 2-page format for concise presentation
- Each template has specific constraints and word limits for optimal ATS compatibility

### 3. **Smart Archive Management** (`/archive`)
- **Version Control**: Save multiple optimized versions with custom labels
- **Quick Access**: Load previous versions instantly
- **Export Options**: Download as PDF or JSON for backup

### 4. **Advanced Customization** (`/customize`)
For power users who need fine-grained control:
- **Custom AI Prompts**: Edit AI instructions for specific industries
- **URL Extraction**: Automatically extract job descriptions from job posting URLs
- **Prompt Templates**: Pre-configured prompts for different job types

## 🧠 AI Integration

### Dynamic Fields System
Your resume data includes special `_dynamic` flags that tell the AI which content can be adapted:

```json
{
  "summary": {
    "_dynamic": true,
    "value": "Your base professional summary..."
  },
  "coreCompetencies": {
    "_dynamic": true,
    "value": ["Skill 1", "Skill 2", "Skill 3"]
  }
}
```

### Customizable AI Prompts
Users can edit the AI prompt to control:
- How job requirements are analyzed
- Which skills to prioritize
- How to adapt the professional summary
- Industry-specific customizations

## 🛠 Technology Stack

- **Next.js 15**: React framework with App Router and TypeScript
- **@react-pdf/renderer**: PDF generation library for ATS-friendly documents  
- **Tailwind CSS 4**: Modern utility-first CSS framework with custom design system
- **React 19**: Latest React with enhanced performance
- **AI Integration**: Compatible with OpenAI, Anthropic, or local LLM services

## 📋 Key Benefits

1. **🎯 Streamlined Workflow**: One-page interface for complete resume optimization
2. **🤖 Template-Aware AI**: Respects page limits and formatting constraints
3. **⚡ Faster Workflow**: Reduced clicks and simplified navigation
4. **🎨 Modern Design**: Clean, minimal interface following design best practices
5. **📱 Better UX**: Consistent colors, typography, and responsive design
6. **🗂️ Better Organization**: Integrated archive with version management

## 🔧 API Endpoints

### Generate PDF (POST)
```
POST /api/generate-pdf
Content-Type: application/json

{
  "resumeData": { /* resume data object */ },
  "template": { /* template configuration */ },
  "filename": "resume.pdf"
}
```

### Extract URL Content (POST)
```
POST /api/extract-url
Content-Type: application/json

{
  "url": "https://company.com/job-posting"
}
```

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd dynamic-resume

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your AI service API keys

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## 📱 Application Structure

### `/` - Main Optimization Hub
- **Complete Workflow**: Job description → Template selection → AI optimization → Download
- **Integrated Archive**: View and load recent optimized versions
- **Real-time Preview**: See changes as you optimize

### `/archive` - Resume Archive
- **Version Management**: All your optimized resume versions in one place
- **Export Options**: Download as PDF or JSON
- **Quick Load**: Restore any previous version instantly

### `/customize` - Advanced Customization
- **Custom AI Prompts**: Fine-tune AI behavior for specific industries
- **URL Extraction**: Automatically extract job descriptions from URLs
- **Prompt Templates**: Pre-configured prompts for different job types

### `/settings` - Configuration
- **Page Limits**: Set target resume page count (1-3 pages)
- **Data Management**: Clear archive data
- **Version Info**: Track application updates

## 🏗 Architecture

### Streamlined Resume Optimization System

```
src/
├── app/
│   ├── page.tsx            # Main optimization hub
│   ├── archive/            # Resume archive management
│   ├── customize/          # Advanced customization with URL extraction
│   ├── settings/           # User preferences and data management
│   └── api/
│       ├── generate-pdf/   # PDF generation with template support
│       └── extract-url/    # Job posting URL extraction
├── components/
│   ├── Header.tsx          # Navigation with burger menu
│   ├── Resume.tsx          # Web resume preview component
│   ├── ResumeDocument.tsx  # PDF resume generation component
│   └── LoadingSpinner.tsx  # Loading states and feedback
├── utils/
│   ├── aiResumeGenerator.ts        # AI optimization logic
│   ├── templateAwarePrompts.ts     # Template-specific AI prompts
│   ├── templateAwareAIService.ts   # Template-constrained AI processing
│   └── errorHandler.ts             # Centralized error handling
├── types/
│   ├── resume.ts           # Resume data interfaces
│   └── template.ts         # Template definitions and constraints
└── services/
    ├── aiService.ts        # AI service integration
    └── urlExtractor.ts     # URL content extraction
```

## 🤖 Template-Aware Optimization Process

1. **Template Analysis**: System analyzes selected template constraints (page limits, word counts)
2. **Content Preprocessing**: Fits mother resume content to template requirements
3. **Job Analysis**: AI analyzes job description for key requirements and skills
4. **Smart Optimization**: AI optimizes content while respecting template constraints
5. **ATS Optimization**: Ensures keyword inclusion and proper formatting
6. **Quality Assurance**: Validates final output meets all template requirements

## 📝 Customization

### Updating Your Base Resume
Edit `data/resume.json` with your information and mark dynamic fields:

```json
{
  "summary": {
    "_dynamic": true,
    "value": "Your adaptable professional summary"
  },
  "coreCompetencies": {
    "_dynamic": true,
    "value": ["Skill 1", "Skill 2", "Skill 3"]
  },
  "header": {
    "_dynamic": false,
    "name": "Your Name",
    "email": "your.email@example.com"
  }
}
```

### Custom AI Prompts
Create industry-specific or role-specific prompts:

```
Analyze this job description and adapt the resume to emphasize:
1. Technical skills that match the requirements
2. Relevant project experience
3. Industry-specific keywords
4. Leadership experience if management role
```

## 🔄 Dynamic vs Static Fields

- **Dynamic Fields** (`_dynamic: true`): Adapted by AI based on job requirements
- **Static Fields** (`_dynamic: false`): Never changed (name, contact info, dates)
- **Hybrid Approach**: Maintains accuracy while enabling customization

## 🚀 Deployment

Optimized for deployment on Vercel and other serverless platforms. The AI-powered PDF generation works without additional configuration.

## 🔮 Future Enhancements

- **Multi-language Support**: Generate resumes in different languages
- **Industry Templates**: Specialized templates for different industries
- **LinkedIn Integration**: Import profile data automatically
- **A/B Testing**: Test different resume versions
- **Analytics Dashboard**: Track application success rates
- **Team Collaboration**: Share and review resume versions
- **Advanced AI Models**: Integration with latest LLMs for better customization

## 📊 Use Cases

### Job Seekers
- **Quick Application**: Adapt resume for each job application
- **Industry Switching**: Emphasize transferable skills
- **Skill Highlighting**: Automatically prioritize relevant experience

### Career Coaches
- **Client Support**: Help clients optimize resumes for specific roles
- **Industry Expertise**: Create industry-specific adaptation strategies

### Recruiters
- **Candidate Preparation**: Help candidates present their best selves
- **Role Matching**: Identify how candidates align with specific positions

## 📄 License

MIT License - Build amazing AI-powered resume tools!

## 🤝 Contributing

Contributions welcome! Help us build the future of intelligent resume customization.

## 📞 Support

Need help customizing your AI prompts or have questions about the resume generation process? Open an issue!
