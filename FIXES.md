# Fixes for CV Application

## 1. Fix Horizontal Scroll in Core Competencies Section

### Issue
The Core Competencies section has horizontal scroll due to `whitespace-nowrap overflow-x-auto` classes on the span elements within list items.

### Solution
Find the component that renders the Core Competencies section (likely in a resume component file) and update the span elements to remove `whitespace-nowrap` and `overflow-x-auto` classes.

**Before:**
```jsx
<span className="leading-snug whitespace-nowrap overflow-x-auto block" style={{maxWidth: '95%'}}>
  {competency}
</span>
```

**After:**
```jsx
<span className="leading-snug block break-words" style={{maxWidth: '100%'}}>
  {competency}
</span>
```

Or if you want to ensure no horizontal scroll anywhere in the resume, add this CSS globally:

```css
/* Prevent horizontal scroll in resume */
main {
  overflow-x: hidden;
  max-width: 100%;
}

/* Ensure Core Competencies list items wrap properly */
section ul li span {
  white-space: normal !important;
  overflow-x: visible !important;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
```

## 2. Set Up Static PDF File Serving

### For Next.js App

1. Place the PDF file in the `public` directory:
   ```
   public/CV-Meysam-Soheilipour.pdf
   ```

2. The file will be accessible at:
   ```
   https://cv.allseen.com/CV-Meysam-Soheilipour.pdf
   ```

3. If you need a custom route, create `pages/CV-Meysam-Soheilipour.pdf.js` or use Next.js rewrites in `next.config.js`:

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/CV-Meysam-Soheilipour.pdf',
        destination: '/CV-Meysam-Soheilipour.pdf',
      },
    ];
  },
};
```

### Alternative: API Route (if needed)

If you need more control, create an API route:

```javascript
// pages/api/cv.js or app/api/cv/route.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const filePath = path.join(process.cwd(), 'public', 'CV-Meysam-Soheilipour.pdf');
  const fileBuffer = fs.readFileSync(filePath);
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="CV-Meysam-Soheilipour.pdf"');
  res.send(fileBuffer);
}
```
