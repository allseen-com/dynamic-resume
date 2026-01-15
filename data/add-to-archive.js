/**
 * Script to add Mother Resume to the Resume Archive
 * 
 * This script can be:
 * 1. Run in browser console on the archive page
 * 2. Imported into your archive component
 * 3. Used as a reference for API calls
 */

const motherResumeArchiveEntry = {
  id: 'mother-resume-cv-meysam-soheilipour',
  title: 'Mother Resume - CV Meysam Soheilipour',
  type: 'mother-resume',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  pdfUrl: '/CV-Meysam-Soheilipour.pdf',
  pdfFilename: 'CV-Meysam-Soheilipour.pdf',
  isCurrent: false,
  metadata: {
    name: 'Meysam Soheilipour',
    email: 'Sam.Soheilipour@gmail.com',
    phone: '(971) 267-9430',
    linkedin: 'MeysamSoheili',
    title: 'Digital Marketing & Growth Strategy | Web Experience & Conversion Optimization | SEO/SEM'
  },
  resumeData: {
    personalInfo: {
      name: 'Meysam Soheilipour',
      email: 'Sam.Soheilipour@gmail.com',
      phone: '(971) 267-9430',
      address: '180 Brannan Street, #320, San Francisco, CA, 94107',
      linkedin: 'MeysamSoheili'
    },
    summary: 'Growth marketing and product leader with 12+ years of experience scaling acquisition, retention, and revenue for global brands and marketplaces. Expert in architecting full-funnel programs (across paid, owned, and earned media) that convert audience insights into measurable outcomes. Skilled at bridging marketing, product, and data teams to drive conversion, LTV, and operational efficiency. Equally adept at GTM strategy, content development, performance analysis, and cross-functional enablement. Thrive in fast-paced environments with startup agility and enterprise discipline.',
    experience: [
      {
        company: 'Trip Ways',
        location: 'Remote, Worldwide',
        position: 'Head of Product & Integrated Marketing',
        startDate: '2024-01',
        endDate: null,
        current: true,
        description: 'Designed and executed a full-funnel growth strategy across SEO/SEM, video, social, CRM, and paid media to scale a global travel marketplace from 1K to 10K+ products across 70+ countries.'
      },
      {
        company: 'Red Ventures, CNET',
        location: 'San Francisco, CA',
        position: 'Sr. Growth Marketing Manager – Commerce & SEO',
        startDate: '2021-12',
        endDate: '2023-12',
        current: false,
        description: 'Directed cross-channel growth initiatives across SEO, YouTube, and Amazon, doubling affiliate revenue and 4× ad performance.'
      },
      {
        company: 'Setare E-Commerce Co.',
        location: 'Tehran, Iran',
        position: 'Co-Founder / Director of Growth & CTO',
        startDate: '2015-04',
        endDate: '2019-06',
        current: false,
        description: 'Scaled a content and e-commerce platform to 15M+ monthly sessions (80% organic), ranking top-20 in Iran and top-1,000 globally.'
      }
    ],
    skills: {
      coreSkills: [
        'Full-Funnel Growth Strategy',
        'Paid & Organic Media (SEO, Paid Search, Paid Social)',
        'Email Marketing & Lifecycle Automation',
        'Funnel Analytics & Attribution Modeling',
        'Campaign & Lead Nurture Automation (HubSpot, n8n, Airtable)',
        'A/B & Multivariate Testing',
        'Persona Development & Journey Mapping',
        'GTM Planning & Stakeholder Alignment',
        'SQL, Looker, GA4, BigQuery'
      ],
      technicalSkills: {
        programming: ['Python', 'SQL', 'PHP', 'Bash'],
        ml_llm: ['OpenAI', 'Vertex AI', 'AWS Bedrock', 'LangChain', 'RAG'],
        cloud: ['AWS', 'Google Cloud', 'GitHub Actions'],
        databases: ['PostgreSQL', 'MySQL', 'Pinecone', 'Qdrant'],
        marketing: ['Google Ads', 'YouTube Studio', 'Meta Ads', 'Looker Studio', 'GA4', 'Search Console'],
        automation: ['N8N', 'Airtable', 'Asana', 'Zapier']
      }
    },
    education: [
      {
        institution: 'Tehran University',
        location: 'Tehran, Iran',
        degree: 'Master of Business Management',
        minor: 'Marketing',
        startDate: '2013-09',
        endDate: '2015-11'
      },
      {
        institution: 'Shahrekord University',
        location: 'Shahrekord, Iran',
        degree: 'Bachelor of Science, Mechanical Engineering',
        minor: 'Computer Science',
        startDate: '2006-09',
        endDate: '2010-07'
      }
    ]
  }
};

/**
 * Function to add resume to archive (localStorage version)
 */
function addToArchive() {
  try {
    // Try different possible localStorage keys
    const possibleKeys = ['resumeArchive', 'archivedResumes', 'resumes', 'resumeData'];
    let archiveKey = null;
    let archive = [];

    // Find the archive key
    for (const key of possibleKeys) {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          archive = JSON.parse(stored);
          archiveKey = key;
          break;
        } catch (e) {
          // Not valid JSON, try next key
        }
      }
    }

    // If no archive found, use default key
    if (!archiveKey) {
      archiveKey = 'resumeArchive';
    }

    // Check if already exists
    const exists = archive.some(r => r.id === motherResumeArchiveEntry.id);
    if (exists) {
      console.log('Resume already exists in archive');
      return { success: false, message: 'Resume already exists' };
    }

    // Add to archive
    archive.push(motherResumeArchiveEntry);
    localStorage.setItem(archiveKey, JSON.stringify(archive));
    
    console.log('✓ Mother Resume added to archive successfully!');
    console.log('Archive key:', archiveKey);
    console.log('Total resumes in archive:', archive.length);
    
    return { success: true, message: 'Resume added successfully', archiveKey, count: archive.length };
  } catch (error) {
    console.error('Error adding to archive:', error);
    return { success: false, message: error.message };
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { motherResumeArchiveEntry, addToArchive };
}

// Auto-run if in browser console
if (typeof window !== 'undefined') {
  console.log('Run addToArchive() to add the mother resume to the archive');
  // Uncomment the line below to auto-add when script is loaded
  // addToArchive();
}
