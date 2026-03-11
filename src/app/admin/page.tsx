"use client";

import React, { useEffect, useState } from "react";

type CredentialsStatus = {
  openai: { configured: boolean; provider: string };
  pinecone: { configured: boolean; indexName?: string; namespace?: string };
} | null;

export default function AdminPage() {
  const [status, setStatus] = useState<CredentialsStatus>(null);
  const [openaiTest, setOpenaiTest] = useState<{ ok: boolean; error?: string } | null>(null);
  const [pineconeTest, setPineconeTest] = useState<{ ok: boolean; error?: string } | null>(null);
  const [openaiLoading, setOpenaiLoading] = useState(false);
  const [pineconeLoading, setPineconeLoading] = useState(false);

  const loadStatus = () => {
    fetch("/api/admin/credentials-status")
      .then((r) => r.json())
      .then((d) =>
        setStatus({
          openai: { configured: d.openai.configured, provider: d.openai.provider },
          pinecone: {
            configured: d.pinecone.configured,
            indexName: d.pinecone.indexName,
            namespace: d.pinecone.namespace,
          },
        })
      )
      .catch(() => setStatus(null));
  };

  useEffect(() => {
    loadStatus();
  }, []);

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
      <div className="max-w-lg mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Admin</h1>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Status</h2>
          {status === null ? (
            <p className="text-slate-500 text-sm">Loading…</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">AI ({status.openai.provider})</span>
                {status.openai.configured ? (
                  <span className="text-emerald-600 font-medium">Configured</span>
                ) : (
                  <span className="text-amber-600">Not set</span>
                )}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Pinecone</span>
                {status.pinecone.configured ? (
                  <span className="text-emerald-600 font-medium">Configured</span>
                ) : (
                  <span className="text-amber-600">Not set</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Test buttons */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Test connection</h2>
          <p className="text-slate-600 text-sm mb-4">Uses credentials from Vercel environment variables.</p>
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
            <div
              className={`mt-3 p-2 rounded-lg text-sm ${openaiTest.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
            >
              OpenAI: {openaiTest.ok ? "OK" : openaiTest.error}
            </div>
          )}
          {pineconeTest && (
            <div
              className={`mt-2 p-2 rounded-lg text-sm ${pineconeTest.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
            >
              Pinecone: {pineconeTest.ok ? "OK" : pineconeTest.error}
            </div>
          )}
        </div>

        {/* Vercel guide */}
        <div className="p-4 bg-slate-100 rounded-xl text-sm text-slate-700">
          <p className="font-medium mb-2">Vercel deployment</p>
          <p>
            Set credentials in <strong>Vercel → Project → Settings → Environment Variables</strong>:{" "}
            <code className="bg-white px-1 rounded">OPENAI_API_KEY</code> (required), and for match score/RAG add{" "}
            <code className="bg-white px-1 rounded">PINECONE_API_KEY</code>, <code className="bg-white px-1 rounded">PINECONE_INDEX</code>,{" "}
            <code className="bg-white px-1 rounded">PINECONE_NAMESPACE</code>. Redeploy after changing variables.
          </p>
        </div>
      </div>
    </div>
  );
}
