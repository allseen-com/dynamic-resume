"use client";

import React, { useEffect, useState } from "react";

type CredentialsStatus = {
  openai: { configured: boolean; provider: string; providerId: string };
  pinecone: {
    configured: boolean;
    indexName?: string;
    namespace?: string;
  };
} | null;

export default function AdminPage() {
  const [status, setStatus] = useState<CredentialsStatus>(null);

  // OpenAI test form
  const [openaiKey, setOpenaiKey] = useState("");
  const [openaiResult, setOpenaiResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [openaiLoading, setOpenaiLoading] = useState(false);

  // Pinecone test form
  const [pineconeKey, setPineconeKey] = useState("");
  const [pineconeIndex, setPineconeIndex] = useState("");
  const [pineconeNamespace, setPineconeNamespace] = useState("resume-chunks");
  const [pineconeResult, setPineconeResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pineconeLoading, setPineconeLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/credentials-status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  const handleTestOpenAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setOpenaiLoading(true);
    setOpenaiResult(null);
    try {
      const res = await fetch("/api/admin/openai-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: openaiKey.trim() }),
      });
      const data = await res.json();
      setOpenaiResult(data);
    } catch (err) {
      setOpenaiResult({ ok: false, error: String(err) });
    } finally {
      setOpenaiLoading(false);
    }
  };

  const handleTestPinecone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPineconeLoading(true);
    setPineconeResult(null);
    try {
      const res = await fetch("/api/admin/pinecone-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: pineconeKey.trim(),
          indexName: pineconeIndex.trim(),
          namespace: pineconeNamespace.trim() || "resume-chunks",
        }),
      });
      const data = await res.json();
      setPineconeResult(data);
    } catch (err) {
      setPineconeResult({ ok: false, error: String(err) });
    } finally {
      setPineconeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin</h1>
          <p className="text-slate-600">
            Add and test OpenAI and Pinecone credentials. For the app to use them in production, set the same values as <strong>Environment Variables</strong> in your Vercel project (Project Settings → Environment Variables).
          </p>
        </div>

        {/* Vercel notice */}
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
          <p className="font-medium mb-1">Deployed on Vercel?</p>
          <p>
            Credentials are not stored by this app. Add them in <strong>Vercel → Project Settings → Environment Variables</strong> for the resume optimizer and vector features to work. Use the forms below to <strong>test</strong> your keys before adding them there.
          </p>
        </div>

        {/* Current status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Current status (from env)</h2>
          {status === null ? (
            <p className="text-slate-500">Loading…</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-slate-700">AI (resume optimization): </span>
                {status.openai.configured ? (
                  <span className="text-emerald-600">Configured ({status.openai.provider})</span>
                ) : (
                  <span className="text-amber-600">Not set</span>
                )}
              </div>
              <div>
                <span className="font-medium text-slate-700">Pinecone (vector / match score): </span>
                {status.pinecone.configured ? (
                  <span className="text-emerald-600">
                    Configured — {status.pinecone.indexName} / {status.pinecone.namespace}
                  </span>
                ) : (
                  <span className="text-amber-600">Not set</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* OpenAI – add and test */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">OpenAI (resume AI)</h2>
          <p className="text-sm text-slate-600 mb-4">
            Used for resume optimization and, if Pinecone is set, for embeddings. Test your key here; then add <code className="bg-slate-100 px-1 rounded">OPENAI_API_KEY</code> in Vercel environment variables.
          </p>
          <form onSubmit={handleTestOpenAI} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">OpenAI API key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-…"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-500"
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              disabled={openaiLoading || !openaiKey.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {openaiLoading ? "Testing…" : "Test connection"}
            </button>
          </form>
          {openaiResult && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${openaiResult.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
            >
              {openaiResult.ok ? "Connection successful. Add this key in Vercel env as OPENAI_API_KEY." : openaiResult.error}
            </div>
          )}
        </div>

        {/* Pinecone – add and test */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Pinecone (vector search)</h2>
          <p className="text-sm text-slate-600 mb-4">
            Optional. Used for RAG and resume–job match score. Test below; then add <code className="bg-slate-100 px-1 rounded">PINECONE_API_KEY</code>, <code className="bg-slate-100 px-1 rounded">PINECONE_INDEX</code>, and optionally <code className="bg-slate-100 px-1 rounded">PINECONE_NAMESPACE</code> in Vercel.
          </p>
          <form onSubmit={handleTestPinecone} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pinecone API key</label>
              <input
                type="password"
                value={pineconeKey}
                onChange={(e) => setPineconeKey(e.target.value)}
                placeholder="Your API key"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-500"
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Index name</label>
              <input
                type="text"
                value={pineconeIndex}
                onChange={(e) => setPineconeIndex(e.target.value)}
                placeholder="e.g. dynamic-resume"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Namespace (optional)</label>
              <input
                type="text"
                value={pineconeNamespace}
                onChange={(e) => setPineconeNamespace(e.target.value)}
                placeholder="resume-chunks"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={pineconeLoading || !pineconeKey.trim() || !pineconeIndex.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {pineconeLoading ? "Testing…" : "Test connection"}
            </button>
          </form>
          {pineconeResult && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm ${pineconeResult.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
            >
              {pineconeResult.ok ? "Connection successful. Add these in Vercel env (PINECONE_API_KEY, PINECONE_INDEX, PINECONE_NAMESPACE)." : pineconeResult.error}
            </div>
          )}
        </div>

        {/* Setup steps for Vercel */}
        <div className="p-4 bg-slate-100 rounded-xl text-sm text-slate-700 space-y-2">
          <p className="font-medium">Vercel setup (GitHub integration)</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Connect your GitHub repo in Vercel and deploy.</li>
            <li>In Vercel: Project → Settings → Environment Variables. Add at least <code className="bg-white px-1 rounded">OPENAI_API_KEY</code> (and optionally <code className="bg-white px-1 rounded">AI_PROVIDER</code>, <code className="bg-white px-1 rounded">OPENAI_MODEL</code>).</li>
            <li>For match score and RAG: create a Pinecone index (dimension 1536, cosine), then add <code className="bg-white px-1 rounded">PINECONE_API_KEY</code>, <code className="bg-white px-1 rounded">PINECONE_INDEX</code>, <code className="bg-white px-1 rounded">PINECONE_NAMESPACE</code>.</li>
            <li>Redeploy after changing env vars. Test credentials on this Admin page first.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
