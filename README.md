# Dynamic Resume - ATS-Friendly PDF Generator

A Next.js application that generates ATS-friendly PDF resumes using React PDF Renderer with **dynamic content customization** for different job types and scenarios.

## 🚀 Features

- **Dynamic Resume Generation**: Create different resume versions tailored for specific job types
- **ATS-Friendly PDF Generation**: Uses `@react-pdf/renderer` for optimal ATS (Applicant Tracking System) compatibility
- **Real Text Content**: All text in the PDF is selectable and searchable, not images
- **Custom Styling**: Professional resume layout with proper typography and spacing that matches the web version
- **Multiple Resume Types**: Marketing, Technical, Data Analysis, Management, and Default versions
- **Serverless Ready**: No headless browser dependencies, perfect for serverless deployments
- **Fast Generation**: Lightweight PDF generation without Chromium overhead

## 🎯 Resume Types

### 1. **Default Resume**
- General purpose resume
- Balanced focus on all skills and experience

### 2. **Marketing Focus**
- Emphasizes marketing and growth skills
- Highlights SEO, digital marketing, and campaign management
- Title: "Growth Marketing Specialist / Digital Marketing Manager / SEO Expert"

### 3. **Technical Focus**
- Highlights technical and development skills
- Emphasizes programming, cloud architecture, and technical leadership
- Title: "Technical Project Manager / Full-Stack Developer / Data Engineer"

### 4. **Data Analysis Focus**
- Focuses on data analysis and business intelligence skills
- Highlights SQL, analytics, and reporting capabilities
- Title: "Data Analyst / Business Intelligence Specialist / Marketing Data Analysis"

### 5. **Management Focus**
- Emphasizes leadership and management experience
- Highlights project management and strategic planning
- Title: "Product Manager / Technical Project Manager / Business Development Manager"

## 🛠 Technology Stack

- **Next.js 15**: React framework with App Router
- **@react-pdf/renderer**: PDF generation library
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework

## 📋 Key Benefits Over Puppeteer/Chromium

1. **No Browser Dependencies**: Eliminates the need for headless Chromium
2. **Better ATS Compatibility**: Generates true text-based PDFs instead of rendered HTML
3. **Faster Performance**: No browser startup time or rendering overhead
4. **Smaller Bundle Size**: Significantly reduced dependencies
5. **Serverless Friendly**: Works perfectly in serverless environments like Vercel

## 🔧 API Endpoints

### Generate PDF (GET)
```
GET /api/generate-pdf?type={resumeType}
```

**Parameters:**
- `type` (optional): Resume type (`default`, `marketing`, `technical`, `data-analysis`, `management`)

**Examples:**
```bash
# Default resume
curl -O /api/generate-pdf

# Marketing-focused resume
curl -O /api/generate-pdf?type=marketing

# Technical-focused resume
curl -O /api/generate-pdf?type=technical
```

### Generate Custom PDF (POST)
```
POST /api/generate-pdf
Content-Type: application/json

{
  "resumeData": { /* ResumeData object */ },
  "config": { /* ResumeConfig object */ }
}
```

## 🚀 Development

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

## 📱 Demo Page

Visit `/demo` to see all resume types in action:
- Switch between different resume types
- Live preview of changes
- Download individual or all PDF types
- Compare different versions side by side

## 🏗 Architecture

### Dynamic Resume System

The application uses a modular architecture for dynamic resume generation:

```
src/
├── components/
│   ├── Resume.tsx           # Web resume component
│   └── ResumeDocument.tsx   # PDF resume component
├── types/
│   └── resume.ts           # Shared interfaces
├── utils/
│   └── resumeGenerator.ts  # Resume customization logic
└── app/
    ├── page.tsx            # Main resume page
    ├── demo/               # Demo page
    └── api/generate-pdf/   # PDF generation API
```

### Key Components

1. **ResumeData Interface**: Defines the structure of resume content
2. **ResumeConfig Interface**: Defines display and formatting options
3. **Resume Generator**: Creates customized versions based on job requirements
4. **Dynamic Components**: Both web and PDF components accept data and config props

## 📝 Customization

### Updating Resume Content

Edit `data/resume.json` to update your resume information:

```json
{
  "header": {
    "name": "Your Name",
    "address": "Your Address",
    "email": "your.email@example.com",
    "phone": "(123) 456-7890"
  },
  "summary": "Your professional summary...",
  "coreCompetencies": ["Skill 1", "Skill 2"],
  "professionalExperience": [
    {
      "company": "Company Name",
      "title": "Job Title",
      "dateRange": "MM/YYYY - MM/YYYY",
      "description": "Job description..."
    }
  ],
  "education": [...],
  "certifications": [...]
}
```

### Creating Custom Resume Types

Use the resume generator utility to create new resume types:

```typescript
import { generateCustomizedResume } from '../utils/resumeGenerator';

const customResume = generateCustomizedResume(
  baseResumeData,
  {
    keywords: ['keyword1', 'keyword2'],
    jobType: 'marketing',
    experienceLevel: 'senior'
  },
  {
    titleBar: {
      main: "Custom Title",
      sub: "Custom Subtitle"
    },
    maxExperienceItems: 3
  }
);
```

### Styling

The resume uses Tailwind CSS classes for web display and custom StyleSheet for PDF generation. Both are synchronized to ensure visual consistency.

## 🔄 Dynamic Features

### Resume Customization
- **Keyword Prioritization**: Reorder skills based on job requirements
- **Section Visibility**: Show/hide sections based on relevance
- **Experience Filtering**: Limit number of experience items
- **Title Customization**: Dynamic title bars for different roles

### PDF Generation
- **Type-based Generation**: Different PDFs for different job types
- **Custom Data Support**: POST endpoint for completely custom resumes
- **Proper Styling**: Company names underlined, proper spacing, matching web design

## 🚀 Deployment

This application is optimized for deployment on Vercel and other serverless platforms. The PDF generation works without any additional configuration or dependencies.

## 📊 Usage Examples

### Web Integration
```tsx
import Resume from '../components/Resume';
import { generateMarketingResume } from '../utils/resumeGenerator';

const { resumeData, config } = generateMarketingResume(baseData);

<Resume 
  resumeData={resumeData} 
  config={config} 
  onDownloadPDF={() => handleDownload('marketing')}
/>
```

### API Usage
```javascript
// Download marketing-focused PDF
const response = await fetch('/api/generate-pdf?type=marketing');
const blob = await response.blob();

// Generate custom PDF
const response = await fetch('/api/generate-pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ resumeData, config })
});
```

## 🔮 Future Enhancements

- **AI-powered Resume Tailoring**: Automatically customize resumes based on job descriptions
- **Multiple Resume Templates**: Different visual layouts and designs
- **Interactive Skill Assessments**: Dynamic skill highlighting
- **Analytics Tracking**: Track PDF downloads and popular resume types
- **Contact Form Integration**: Direct contact from resume
- **Version History**: Track and manage different resume versions

## 📄 License

MIT License - feel free to use this template for your own dynamic resume system!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have questions or need help with implementation, please open an issue in the repository.
