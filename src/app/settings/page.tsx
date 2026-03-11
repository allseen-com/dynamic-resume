"use client";

import React, { useEffect, useState } from "react";
import { getDefaultPrompt, PROMPT_TEMPLATES, getPromptTemplate } from "../../utils/promptTemplates";

const PROMPT_MODE_KEY = "promptMode";

type CredentialsStatus = {
  openai: { configured: boolean; provider: string };
  pinecone: { configured: boolean; indexName?: string; namespace?: string };
} | null;

export default function SettingsPage() {
  const [targetPages, setTargetPages] = useState(2);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [promptMode, setPromptMode] = useState<"auto" | "manual">("auto");
  const [promptTemplateId, setPromptTemplateId] = useState("general");
  const [customPrompt, setCustomPrompt] = useState("");
  const [credentialsStatus, setCredentialsStatus] = useState<CredentialsStatus>(null);
  const [openaiTest, setOpenaiTest] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pineconeTest, setPineconeTest] = useState<{ ok: boolean; error?: string } | null>(null);
  const [openaiLoading, setOpenaiLoading] = useState(false);
  const [pineconeLoading, setPineconeLoading] = useState(false);

  useEffect(() => {
    const storedPages = localStorage.getItem("resumeTargetPages");
    if (storedPages) setTargetPages(Number(storedPages));
    const storedMode = localStorage.getItem(PROMPT_MODE_KEY) as "auto" | "manual" | null;
    setPromptMode(storedMode === "manual" ? "manual" : "auto");
    const storedPrompt = localStorage.getItem("customAIPrompt");
    const storedTemplateId = localStorage.getItem("promptTemplateId") || "general";
    setPromptTemplateId(storedTemplateId);
    setCustomPrompt(storedPrompt || getDefaultPrompt());
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

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const template = getPromptTemplate(id);
    setPromptTemplateId(id);
    if (template) {
      setCustomPrompt(template.prompt);
      localStorage.setItem("promptTemplateId", id);
      localStorage.setItem("customAIPrompt", template.prompt);
      showToast();
    }
  };

  const setMode = (mode: "auto" | "manual") => {
    setPromptMode(mode);
    localStorage.setItem(PROMPT_MODE_KEY, mode);
    showToast();
  };

  const savePrompt = () => {
    localStorage.setItem("customAIPrompt", customPrompt);
    showToast();
  };

  const resetPromptToDefault = () => {
    if (confirm("Reset to default prompt? This will overwrite your custom text.")) {
      const defaultPrompt = getDefaultPrompt();
      setCustomPrompt(defaultPrompt);
      setPromptTemplateId("general");
      localStorage.setItem("customAIPrompt", defaultPrompt);
      localStorage.setItem("promptTemplateId", "general");
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
          <p className="text-slate-600 text-sm mt-1">Configure optimization, AI prompt, and credentials.</p>
        </div>

        {/* 1. Resume optimization – most used */}
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

        {/* 2. AI prompt – Auto (recommended) or Manual */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="heading-section">Resume customization</h2>
          <p className="text-slate-600 text-sm mb-4">
            How the system chooses how to optimize your resume for each job.
          </p>
          <div className="flex flex-col gap-3 mb-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="promptMode"
                checked={promptMode === "auto"}
                onChange={() => setMode("auto")}
                className="mt-1"
              />
              <span>
                <strong className="text-slate-800">Auto (recommended)</strong> – The system picks the best strategy from the job description (e.g. technical, marketing, management). No need to change settings for each role.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="promptMode"
                checked={promptMode === "manual"}
                onChange={() => setMode("manual")}
                className="mt-1"
              />
              <span>
                <strong className="text-slate-800">Manual</strong> – You choose a prompt template and can edit the prompt text below.
              </span>
            </label>
          </div>
          {promptMode === "manual" && (
            <>
              <label className="label-app">Prompt template</label>
              <select
                value={promptTemplateId}
                onChange={handleTemplateChange}
                className="input-app w-full mb-4"
              >
                {PROMPT_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} – {t.description}
                  </option>
                ))}
              </select>
              <label className="label-app">Custom prompt text (editable)</label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="textarea-app w-full font-mono h-64"
                placeholder="AI prompt..."
              />
              <div className="flex gap-2 flex-wrap mt-3">
                <button onClick={savePrompt} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm">
                  Save prompt
                </button>
                <button onClick={resetPromptToDefault} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium text-sm">
                  Reset to default
                </button>
              </div>
            </>
          )}
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
                <span className="text-slate-700">Pinecone</span>
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

        {/* 5. Deployment (one-time) */}
        <section className="bg-slate-100 rounded-xl p-5 text-sm text-slate-700">
          <h2 className="font-semibold text-slate-800 mb-2">Vercel deployment</h2>
          <p>
            Set variables in <strong>Vercel → Project → Settings → Environment Variables</strong>:{" "}
            <code className="bg-white px-1 rounded">OPENAI_API_KEY</code> (required); for match score and RAG add{" "}
            <code className="bg-white px-1 rounded">PINECONE_API_KEY</code>, <code className="bg-white px-1 rounded">PINECONE_INDEX</code>,{" "}
            <code className="bg-white px-1 rounded">PINECONE_NAMESPACE</code>. Redeploy after changes.
          </p>
        </section>

        {/* 6. About */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="heading-section">About</h2>
          <p className="text-slate-600 text-sm">
            AI-powered resume optimization for job descriptions. ATS-friendly output and optional vector search (Pinecone) for match score and RAG.
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
