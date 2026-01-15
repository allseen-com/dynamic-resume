# Instructions to Add PDF to Resume Archive

## Overview
This document explains how to add the `CV-Meysam-Soheilipour.pdf` file to the Resume Archive section of your application.

## Steps

### 1. Copy PDF to Public Directory
First, ensure the PDF is in your Next.js `public` directory:
```bash
cp CV-Meysam-Soheilipour.pdf /path/to/your/project/public/
```

### 2. Add Archive Entry

The archive system likely stores resume data in one of these locations:
- **LocalStorage** (browser-based storage)
- **Database** (if using a backend)
- **JSON file** (if using file-based storage)
- **API endpoint** (if using a backend API)

### Option A: If using LocalStorage (Client-side)

Add this to your archive page component or create an initialization script:

```javascript
// Add to archive initialization or component
const addMotherResumeToArchive = () => {
  const archiveEntry = {
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
      linkedin: 'MeysamSoheili'
    }
  };

  // Get existing archive
  const existingArchive = JSON.parse(localStorage.getItem('resumeArchive') || '[]');
  
  // Check if already exists
  if (!existingArchive.find(r => r.id === archiveEntry.id)) {
    existingArchive.push(archiveEntry);
    localStorage.setItem('resumeArchive', JSON.stringify(existingArchive));
    console.log('Mother resume added to archive');
  }
};
```

### Option B: If using a Database

Import the `resume-archive-entry.json` file and insert it into your database:

```javascript
// Example for MongoDB
const archiveEntry = require('./resume-archive-entry.json');
await db.collection('resumes').insertOne(archiveEntry);

// Example for PostgreSQL
const archiveEntry = require('./resume-archive-entry.json');
await db.query('INSERT INTO resumes (data) VALUES ($1)', [JSON.stringify(archiveEntry)]);
```

### Option C: If using a JSON file

Append the entry to your archive JSON file:

```javascript
const fs = require('fs');
const archiveEntry = require('./resume-archive-entry.json');
const archive = JSON.parse(fs.readFileSync('./data/archive.json', 'utf8'));
archive.push(archiveEntry);
fs.writeFileSync('./data/archive.json', JSON.stringify(archive, null, 2));
```

### Option D: If using an API

Create an API endpoint or use an existing one to add the resume:

```javascript
// POST to your archive API
const archiveEntry = require('./resume-archive-entry.json');
await fetch('/api/archive', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(archiveEntry)
});
```

## Verification

After adding the entry:
1. Navigate to `/archive` page
2. You should see "Mother Resume - CV Meysam Soheilipour" in the archive list
3. You should be able to download it as PDF or JSON
4. The PDF should be accessible at `/CV-Meysam-Soheilipour.pdf`

## Files Provided

1. **CV-Meysam-Soheilipour.pdf** - The PDF file to be archived
2. **resume-archive-entry.json** - The resume data structure for the archive
3. **add-to-archive-instructions.md** - This instruction file

## Next Steps

1. Identify which storage method your application uses (check your archive page component)
2. Follow the appropriate option above
3. Test that the resume appears in the archive
4. Verify the PDF is accessible and downloadable
