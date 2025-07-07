# Dynamic Resume - AI-Powered Resume Customization

A Next.js application that generates **AI-customized, ATS-friendly PDF resumes** using React PDF Renderer with **intelligent content adaptation** based on job descriptions and requirements.

## 🚀 Key Features

- **🤖 AI-Powered Resume Customization**: Automatically adapt your resume content to match specific job requirements
- **📄 Job Description Analysis**: Paste job descriptions or URLs to automatically tailor your resume
- **✏️ Editable AI Prompts**: Customize the AI logic to match your preferences and industry
- **🎯 Dynamic Content Replacement**: Smart replacement of dynamic fields while preserving static information
- **📱 Real-time Preview**: See your customized resume update live as you input job requirements
- **📄 ATS-Friendly PDF Generation**: Uses `@react-pdf/renderer` for optimal ATS (Applicant Tracking System) compatibility
- **🔄 Multiple Resume Variants**: Generate different versions for different job applications
- **⚡ Serverless Ready**: No headless browser dependencies, perfect for serverless deployments

## 🎯 How It Works

### 1. **AI-Powered Apply Page** (`/apply`)
- **Job Description Input**: Paste job description text or provide a URL
- **AI Prompt Customization**: Edit the AI prompt to control how your resume is adapted
- **Dynamic Field Replacement**: AI analyzes job requirements and updates dynamic fields
- **Live Preview**: See your customized resume in real-time
- **One-Click PDF**: Generate and download your tailored resume

### 2. **Resume Templates** (`/templates`)
- View pre-made resume types: Marketing, Technical, Data Analysis, Management
- Compare different approaches to resume customization
- Download template-based PDFs

### 3. **Smart Content Adaptation**
The AI analyzes job descriptions and intelligently updates:
- **Core Competencies**: Prioritizes relevant skills
- **Technical Proficiency**: Highlights matching technologies
- **Professional Experience**: Emphasizes relevant experience
- **Summary**: Adapts career summary to match role requirements
- **Title Bar**: Creates role-specific professional titles

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

- **Next.js 15**: React framework with App Router
- **@react-pdf/renderer**: PDF generation library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **AI Integration**: Ready for OpenAI, Anthropic, or local LLM integration

## 📋 Key Benefits Over Traditional Resume Tools

1. **AI-Powered Customization**: Automatically adapts content to job requirements
2. **No Manual Editing**: Reduces time spent manually tweaking resumes
3. **ATS Optimization**: Generates true text-based PDFs with relevant keywords
4. **Real-time Adaptation**: See changes instantly as you input job requirements
5. **Consistent Formatting**: Maintains professional appearance across all versions
6. **Serverless Friendly**: Fast, lightweight, and scalable

## 🔧 API Endpoints

### Generate AI-Customized PDF (POST)
```
POST /api/generate-pdf
Content-Type: application/json

{
  "jobDescription": "Job description text...",
  "customPrompt": "Custom AI prompt...",
  "resumeType": "custom"
}
```

### Generate Template PDF (GET)
```
GET /api/generate-pdf?type={resumeType}
```

**Parameters:**
- `type` (optional): Resume type (`marketing`, `technical`, `data-analysis`, `management`)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📱 Application Pages

### `/apply` - AI Resume Customization
- **Job Description Input**: Paste job posting or URL
- **AI Prompt Editor**: Customize how AI adapts your resume
- **Live Preview**: Real-time resume updates
- **PDF Generation**: Download customized resume

### `/templates` - Pre-made Resume Types
- **Marketing Focus**: Emphasizes growth, SEO, and digital marketing
- **Technical Focus**: Highlights programming, cloud, and technical skills
- **Data Analysis**: Focuses on analytics, SQL, and business intelligence
- **Management Focus**: Emphasizes leadership and strategic planning

### `/` - Homepage
- Overview of the application
- Quick access to apply and templates

## 🏗 Architecture

### AI-Powered Resume System

```
src/
├── app/
│   ├── apply/              # AI-powered resume customization
│   ├── templates/          # Pre-made resume templates
│   └── api/generate-pdf/   # PDF generation with AI support
├── components/
│   ├── Resume.tsx          # Web resume component
│   ├── ResumeDocument.tsx  # PDF resume component
│   └── ApplyForm.tsx       # Job description and AI prompt interface
├── utils/
│   ├── aiResumeGenerator.ts # AI-powered resume customization
│   ├── resumeGenerator.ts   # Template-based generation
│   └── jobDescriptionParser.ts # Job posting analysis
└── types/
    └── resume.ts           # Shared interfaces
```

## 🤖 AI Resume Generation Process

1. **Job Analysis**: AI analyzes job description for key requirements
2. **Skill Matching**: Identifies relevant skills from your profile
3. **Content Adaptation**: Updates dynamic fields while preserving static info
4. **Keyword Optimization**: Ensures ATS-friendly keyword inclusion
5. **Professional Formatting**: Maintains consistent, professional appearance

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
