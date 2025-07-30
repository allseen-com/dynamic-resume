"use client";
import React, { useEffect, useState } from 'react';
import { getDefaultPrompt } from '../../utils/promptTemplates';

export default function SettingsPage() {
  const [targetPages, setTargetPages] = useState<number>(2);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('resumeTargetPages');
    if (stored) setTargetPages(Number(stored));
    
    // Load custom prompt or default
    const storedPrompt = localStorage.getItem('customAIPrompt');
    setCustomPrompt(storedPrompt || getDefaultPrompt());
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(5, Number(e.target.value))); // Limit to 1-5 pages
    setTargetPages(value);
    localStorage.setItem('resumeTargetPages', String(value));
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all archived resumes? This cannot be undone.')) {
      localStorage.removeItem('resumeArchive');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2000);
    }
  };

  const savePrompt = () => {
    localStorage.setItem('customAIPrompt', customPrompt);
    setIsEditingPrompt(false);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);
  };

  const resetToDefault = () => {
    if (confirm('Reset to default prompt? This will lose any custom changes.')) {
      const defaultPrompt = getDefaultPrompt();
      setCustomPrompt(defaultPrompt);
      localStorage.setItem('customAIPrompt', defaultPrompt);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg">
          Settings saved!
        </div>
      )}

      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 text-slate-900">Settings</h1>
          <p className="text-slate-600">Configure your resume optimization preferences.</p>
        </div>

        <div className="space-y-6">
          {/* Resume Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Resume Optimization</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Resume Page Count
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={targetPages}
                    onChange={handleChange}
                    className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 w-24"
                  />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((pages) => (
                      <button
                        key={pages}
                        onClick={() => handleChange({ target: { value: pages.toString() } } as React.ChangeEvent<HTMLInputElement>)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          targetPages === pages
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {pages} page{pages !== 1 ? 's' : ''}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  The AI will optimize your resume to fit within this page limit. Most employers prefer 1-2 pages.
                </p>
              </div>
            </div>
          </div>

          {/* AI Prompt Management */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">AI Prompt Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Custom AI Prompt
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Customize the prompt used for AI optimization. This controls how the AI analyzes and optimizes your resume.
                </p>
                
                {isEditingPrompt ? (
                  <div className="space-y-3">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      className="w-full h-64 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 text-sm font-mono"
                      placeholder="Enter your custom AI prompt..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={savePrompt}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                      >
                        Save Prompt
                      </button>
                      <button
                        onClick={() => setIsEditingPrompt(false)}
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={resetToDefault}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
                        {customPrompt.slice(0, 300)}
                        {customPrompt.length > 300 && '...'}
                      </pre>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingPrompt(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                      >
                        Edit Prompt
                      </button>
                      <button
                        onClick={resetToDefault}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Data Management</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Clear Archive Data
                </label>
                <p className="text-sm text-slate-500 mb-3">
                  Remove all saved resume versions from your browser storage.
                </p>
                <button
                  onClick={clearAllData}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">About</h2>
            
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                This Resume Builder uses AI to optimize your resume for specific job descriptions, 
                ensuring maximum relevance and ATS compatibility.
              </p>
              <div className="flex items-center gap-2">
                <span className="font-medium">Version:</span>
                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">0.1.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 