'use client';

import React from 'react';

export default function DownloadButton() {
  const download = () => {
    window.open('/api/generate-pdf', '_blank');
  };

  return (
    <button 
      onClick={download}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
    >
      Download ATS-Friendly PDF
    </button>
  );
} 