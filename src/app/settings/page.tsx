"use client";
import React, { useEffect, useState } from 'react';

export default function SettingsPage() {
  const [targetPages, setTargetPages] = useState<number>(2);

  useEffect(() => {
    const stored = localStorage.getItem('resumeTargetPages');
    if (stored) setTargetPages(Number(stored));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Number(e.target.value));
    setTargetPages(value);
    localStorage.setItem('resumeTargetPages', String(value));
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-900">Settings</h1>
      <div className="mb-6">
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Target Resume Page Count
        </label>
        <input
          type="number"
          min={1}
          value={targetPages}
          onChange={handleChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-32"
        />
        <p className="text-sm text-gray-500 mt-2">The AI will try to fit your resume into this many A4 pages. Default is 2.</p>
      </div>
    </div>
  );
} 