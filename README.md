# Dynamic Resume

A modern, responsive resume website built with Next.js and Tailwind CSS. Features a clean, professional design with PDF download functionality.

## Features

- **Clean, Professional Design**: Modern layout optimized for both screen viewing and printing
- **PDF Download**: One-click PDF generation using browser print functionality
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Print-Optimized**: Special CSS styling ensures perfect PDF output
- **Data-Driven**: Resume content is stored in JSON format for easy updates

## Tech Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vercel**: Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dynamic-resume
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
dynamic-resume/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main resume page
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   └── utils/
│       └── tailorResume.ts   # Future dynamic functionality
├── data/
│   └── resume.json           # Resume data
└── public/                   # Static assets
```

## Customization

### Updating Resume Content

Edit `data/resume.json` to update your resume information:

- Personal details (name, contact info)
- Professional summary
- Core competencies
- Technical skills
- Work experience
- Education
- Certifications

### Styling

The resume uses Tailwind CSS classes. You can customize the appearance by modifying the classes in `src/app/page.tsx`.

## Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

## Future Enhancements

- AI-powered resume tailoring based on job descriptions
- Multiple resume templates
- Interactive skill assessments
- Analytics tracking
- Contact form integration

## License

MIT License - feel free to use this template for your own resume!
