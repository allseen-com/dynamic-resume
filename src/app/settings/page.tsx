"use client";

import React, { useEffect, useState } from "react";
import {
  getSectionPrompts,
  setSectionPrompt,
  getDefaultSectionPrompt,
  type SectionPrompts,
} from "../../utils/sectionPrompts";

const SECTION_LABELS: Record<keyof SectionPrompts, string> = {
  headline: "Headline / Title bar",
  summary: "Professional summary",
  technical: "Technical skills",
  experience: "Work experience",
  final: "Final (smoothing)",
};

const SECTION_HINTS: Partial<Record<keyof SectionPrompts, string>> = {
  summary: "Limit: 80–120 words.",
  headline: "Output: main + sub title only.",
  technical: "Output: coreCompetencies + technicalProficiency.",
  experience: "Output: professionalExperience array. Use MM/YYYY for dates.",
  final: "Receives merged draft; smooth and return full resume + summary + keyChanges.",
};

type CredentialsStatus = {
  openai: { configured: boolean; provider: string };
  pinecone: { configured: boolean; indexName?: string; namespace?: string };
} | null;

export default function SettingsPage() {
  const [targetPages, setTargetPages] = useState(2);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [sectionPrompts, setSectionPrompts] = useState<SectionPrompts>({
    headline: "",
    summary: "",
    technical: "",
    experience: "",
    final: "",
  });
  const [expandedSection, setExpandedSection] = useState<keyof SectionPrompts | null>("headline");
  const [credentialsStatus, setCredentialsStatus] = useState<CredentialsStatus>(null);
  const [openaiTest, setOpenaiTest] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pineconeTest, setPineconeTest] = useState<{ ok: boolean; error?: string } | null>(null);
  const [openaiLoading, setOpenaiLoading] = useState(false);
  const [pineconeLoading, setPineconeLoading] = useState(false);

  useEffect(() => {
    const storedPages = localStorage.getItem("resumeTargetPages");
    if (storedPages) setTargetPages(Number(storedPages));
    setSectionPrompts(getSectionPrompts());
  }, []);

  useEffect(() => {
    fetch("/api/admin/credentials-status")
      .then((r) => r.json())
      .then((d) =>
        setCredentialsStatus({
          openai: { configured: d.openai?.configured, provider: d.openai?.provider || "openai" },
          pinecone: {
            configured: d.pinecone?.configured,
            indexName: d.pinecone?.indexName,
            namespace: d.pinecone?.namespace,
          },
        })
      )
      .catch(() => setCredentialsStatus(null));
  }, []);

  const showToast = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2000);
  };

  const handleTargetPagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(5, Number(e.target.value)));
    setTargetPages(value);
    localStorage.setItem("resumeTargetPages", String(value));
    showToast();
  };

  const handleSectionPromptChange = (section: keyof SectionPrompts, value: string) => {
    setSectionPrompts((prev) => ({ ...prev, [section]: value }));
  };

  const saveSectionPrompt = (section: keyof SectionPrompts) => {
    setSectionPrompt(section, sectionPrompts[section] ?? "");
    showToast();
  };

  const resetSectionToDefault = (section: keyof SectionPrompts) => {
    if (confirm(`Reset "${SECTION_LABELS[section]}" to default? This will overwrite your custom text.`)) {
      const def = getDefaultSectionPrompt(section);
      setSectionPrompts((prev) => ({ ...prev, [section]: def }));
      setSectionPrompt(section, def);
      showToast();
    }
  };

  const clearAllData = () => {
    if (confirm("Clear all archived resumes? This cannot be undone.")) {
      localStorage.removeItem("resumeArchive");
      showToast();
    }
  };

  const handleTestOpenAI = async () => {
    setOpenaiLoading(true);
    setOpenaiTest(null);
    try {
      const res = await fetch("/api/admin/test-openai");
      const data = await res.json();
      setOpenaiTest(data);
    } catch {
      setOpenaiTest({ ok: false, error: "Request failed" });
    } finally {
      setOpenaiLoading(false);
    }
  };

  const handleTestPinecone = async () => {
    setPineconeLoading(true);
    setPineconeTest(null);
    try {
      const res = await fetch("/api/admin/test-pinecone");
      const data = await res.json();
      setPineconeTest(data);
    } catch {
      setPineconeTest({ ok: false, error: "Request failed" });
    } finally {
      setPineconeLoading(false);
    }
  };

  const sections: (keyof SectionPrompts)[] = ["headline", "summary", "technical", "experience", "final"];

  return (
    <div className="min-h-screen bg-slate-50">
      {showSuccessToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg">
          Settings saved
        </div>
      )}

      <div className="max-w-2xl mx-auto py-8 px-4 space-y-8">
        <div>
          <h1 className="heading-page">Settings</h1>
          <p className="text-slate-600 text-sm mt-1">Configure optimization, section prompts, and credentials.</p>
        </div>

        {/* 1. Resume optimization */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="heading-section">Resume optimization</h2>
          <label className="label-app">Target resume page count</label>
          <div className="flex items-center gap-4 flex-wrap">
            <input
              type="number"
              min={1}
              max={5}
              value={targetPages}
              onChange={handleTargetPagesChange}
              className="input-app w-24"
            />
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setTargetPages(n);
                    localStorage.setItem("resumeTargetPages", String(n));
                    showToast();
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    targetPages === n ? "bg-indigo-100 text-indigo-700 border border-indigo-300" : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  {n} page{n !== 1 ? "s" : ""}
                </button>
              ))}
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-2">AI will fit the resume within this page limit.</p>
        </section>

        {/* 2. Section-based prompts */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="heading-section">Resume customization (section prompts)</h2>
          <p className="text-slate-600 text-sm mb-4">
            Each main section has its own prompt. Edit below to improve results. Pinecone (RAG) is required for optimization and match score.
          </p>
          <div className="space-y-4">
            {sections.map((sectionId) => (
              <div key={sectionId} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === sectionId ? null : sectionId)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 text-left font-medium text-slate-800"
                >
                  {SECTION_LABELS[sectionId]}
                  <span className="text-slate-500 text-sm font-normal">
                    {expandedSection === sectionId ? "Collapse" : "Expand"}
                  </span>
                </button>
                {expandedSection === sectionId && (
                  <div className="p-4 border-t border-slate-200 bg-white">
                    {SECTION_HINTS[sectionId] && (
                      <p className="text-slate-500 text-xs mb-2">{SECTION_HINTS[sectionId]}</p>
                    )}
                    <textarea
                      value={sectionPrompts[sectionId] ?? ""}
                      onChange={(e) => handleSectionPromptChange(sectionId, e.target.value)}
                      className="textarea-app w-full font-mono text-sm h-48"
                      placeholder={`Prompt for ${SECTION_LABELS[sectionId]}...`}
                    />
                    <div className="flex gap-2 flex-wrap mt-3">
                      <button
                        onClick={() => saveSectionPrompt(sectionId)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => resetSectionToDefault(sectionId)}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm"
                      >
                        Reset to default
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 3. Credentials & connection */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="heading-section">Credentials & connection</h2>
          {credentialsStatus === null ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : (
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">AI ({credentialsStatus.openai.provider})</span>
                {credentialsStatus.openai.configured ? (
                  <span className="text-emerald-600 font-medium">Configured</span>
                ) : (
                  <span className="text-amber-600">Not set</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Pinecone (required for optimization & match score)</span>
                {credentialsStatus.pinecone.configured ? (
                  <span className="text-emerald-600 font-medium">Configured</span>
                ) : (
                  <span className="text-amber-600">Not set</span>
                )}
              </div>
            </div>
          )}
          <p className="text-slate-500 text-sm mb-3">Uses credentials from Vercel environment variables.</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleTestOpenAI}
              disabled={openaiLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
            >
              {openaiLoading ? "Testing…" : "Test OpenAI"}
            </button>
            <button
              type="button"
              onClick={handleTestPinecone}
              disabled={pineconeLoading}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 text-sm font-medium"
            >
              {pineconeLoading ? "Testing…" : "Test Pinecone"}
            </button>
          </div>
          {openaiTest && (
            <div className={`mt-3 p-2 rounded-lg text-sm ${openaiTest.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              OpenAI: {openaiTest.ok ? "OK" : openaiTest.error}
            </div>
          )}
          {pineconeTest && (
            <div className={`mt-2 p-2 rounded-lg text-sm ${pineconeTest.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
              Pinecone: {pineconeTest.ok ? "OK" : pineconeTest.error}
            </div>
          )}
        </section>

        {/* 4. Data management */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="heading-section">Data management</h2>
          <p className="text-slate-600 text-sm mb-3">Remove all saved resume versions from browser storage.</p>
          <button onClick={clearAllData} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm">
            Clear archive
          </button>
        </section>

        {/* 5. Deployment */}
        <section className="bg-slate-100 rounded-xl p-5 text-sm text-slate-700">
          <h2 className="font-semibold text-slate-800 mb-2">Vercel deployment</h2>
          <p>
            Set variables in <strong>Vercel → Project → Settings → Environment Variables</strong>:{" "}
            <code className="bg-white px-1 rounded">OPENAI_API_KEY</code> (required); for optimization and match score set{" "}
            <code className="bg-white px-1 rounded">PINECONE_API_KEY</code>, <code className="bg-white px-1 rounded">PINECONE_INDEX</code>,{" "}
            <code className="bg-white px-1 rounded">PINECONE_NAMESPACE</code>. Redeploy after changes.
          </p>
        </section>

        {/* 6. About */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="heading-section">About</h2>
          <p className="text-slate-600 text-sm">
            AI-powered resume optimization with section-based prompts. RAG (Pinecone) is required for optimization and match score.
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="font-medium text-slate-700">Version</span>
            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs">0.1.0</span>
          </div>
        </section>
      </div>
    </div>
  );
}
