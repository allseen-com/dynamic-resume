"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ResumeData } from "../../types/resume";

const emptyExperience = (): ResumeData["professionalExperience"][0] => ({
  company: "",
  _dynamic_company: true,
  title: "",
  _dynamic_title: true,
  dateRange: "",
  _dynamic_dateRange: true,
  description: { _dynamic: true, value: "" },
});

const emptyEducation = (): { school: string; dateRange: string; degree: string } => ({
  school: "",
  dateRange: "",
  degree: "",
});

function ListEditor<T>({
  items,
  onChange,
  renderItem,
  emptyItem,
  addLabel = "Add",
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, onChange: (item: T) => void) => React.ReactNode;
  emptyItem: () => T;
  addLabel?: string;
}) {
  const add = useCallback(() => {
    onChange([...items, emptyItem()]);
  }, [items, onChange, emptyItem]);
  const remove = useCallback(
    (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange]
  );
  const update = useCallback(
    (index: number, item: T) => {
      const next = [...items];
      next[index] = item;
      onChange(next);
    },
    [items, onChange]
  );
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="flex-1 min-w-0">{renderItem(item, i, (v) => update(i, v))}</div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded border border-slate-300 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
            aria-label="Remove"
          >
            −
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full py-2 rounded border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-1"
      >
        + {addLabel}
      </button>
    </div>
  );
}

export default function MotherResumePage() {
  const [data, setData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resume");
      if (!res.ok) throw new Error("Failed to load resume");
      const json = await res.json();
      setData(json as ResumeData);
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Load failed" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!data) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }
      setMessage({ type: "ok", text: "Saved." });
    } catch (e) {
      setMessage({ type: "err", text: e instanceof Error ? e.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-500 hover:text-slate-700"
              aria-label="Back"
            >
              ←
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Mother Resume</h1>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 py-2 px-3 rounded text-sm ${message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          {/* Header */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Header</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={data.header.name}
                onChange={(e) => setData({ ...data, header: { ...data.header, name: e.target.value } })}
                placeholder="Name"
              />
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={data.header.email}
                onChange={(e) => setData({ ...data, header: { ...data.header, email: e.target.value } })}
                placeholder="Email"
              />
              <input
                className="w-full sm:col-span-2 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={data.header.address}
                onChange={(e) => setData({ ...data, header: { ...data.header, address: e.target.value } })}
                placeholder="Address"
              />
              <input
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                value={data.header.phone}
                onChange={(e) => setData({ ...data, header: { ...data.header, phone: e.target.value } })}
                placeholder="Phone"
              />
            </div>
          </section>

          {/* Summary */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Summary</h2>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm min-h-[100px]"
              value={data.summary.value}
              onChange={(e) => setData({ ...data, summary: { ...data.summary, value: e.target.value } })}
              placeholder="Professional summary"
            />
          </section>

          {/* Core competencies */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Core competencies</h2>
            <ListEditor
              items={data.coreCompetencies.value}
              onChange={(value) => setData({ ...data, coreCompetencies: { ...data.coreCompetencies, value } })}
              emptyItem={() => ""}
              addLabel="Add competency"
              renderItem={(item, _, onChange) => (
                <input
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  value={item}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="e.g. Growth Marketing"
                />
              )}
            />
          </section>

          {/* Technical proficiency */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Technical proficiency</h2>
            {(
              [
                { key: "programming", label: "Programming" },
                { key: "cloudData", label: "Cloud / Data" },
                { key: "analytics", label: "Analytics" },
                { key: "mlAi", label: "ML / AI" },
                { key: "productivity", label: "Productivity" },
                { key: "marketingAds", label: "Marketing / Ads" },
              ] as const
            ).map(({ key, label }) => (
              <div key={key} className="mb-4">
                <span className="text-xs font-medium text-slate-500">{label}</span>
                <ListEditor
                  items={data.technicalProficiency[key]}
                  onChange={(value) =>
                    setData({
                      ...data,
                      technicalProficiency: { ...data.technicalProficiency, [key]: value },
                    })
                  }
                  emptyItem={() => ""}
                  addLabel={`Add ${label}`}
                  renderItem={(item, _, onChange) => (
                    <input
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      value={item}
                      onChange={(e) => onChange(e.target.value)}
                      placeholder="e.g. Python"
                    />
                  )}
                />
              </div>
            ))}
          </section>

          {/* Professional experience */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Professional experience</h2>
            <ListEditor
              items={data.professionalExperience}
              onChange={(value) => setData({ ...data, professionalExperience: value })}
              emptyItem={emptyExperience}
              addLabel="Add experience"
              renderItem={(item, _, onChange) => (
                <div className="space-y-2 p-2 border border-slate-100 rounded-lg">
                  <input
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                    value={item.company}
                    onChange={(e) => onChange({ ...item, company: e.target.value })}
                    placeholder="Company"
                  />
                  <input
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                    value={item.title}
                    onChange={(e) => onChange({ ...item, title: e.target.value })}
                    placeholder="Title"
                  />
                  <input
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm"
                    value={item.dateRange}
                    onChange={(e) => onChange({ ...item, dateRange: e.target.value })}
                    placeholder="Date range (e.g. 01/2020 – Present)"
                  />
                  <textarea
                    className="w-full px-3 py-2 border border-slate-200 rounded text-sm min-h-[80px]"
                    value={item.description.value}
                    onChange={(e) => onChange({ ...item, description: { ...item.description, value: e.target.value } })}
                    placeholder="Description"
                  />
                </div>
              )}
            />
          </section>

          {/* Education */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Education</h2>
            <ListEditor
              items={data.education.value}
              onChange={(value) => setData({ ...data, education: { ...data.education, value } })}
              emptyItem={emptyEducation}
              addLabel="Add education"
              renderItem={(item, _, onChange) => (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2 border border-slate-100 rounded-lg">
                  <input
                    className="sm:col-span-2 px-3 py-2 border border-slate-200 rounded text-sm"
                    value={item.school}
                    onChange={(e) => onChange({ ...item, school: e.target.value })}
                    placeholder="School"
                  />
                  <input
                    className="px-3 py-2 border border-slate-200 rounded text-sm"
                    value={item.dateRange}
                    onChange={(e) => onChange({ ...item, dateRange: e.target.value })}
                    placeholder="Dates"
                  />
                  <input
                    className="sm:col-span-3 px-3 py-2 border border-slate-200 rounded text-sm"
                    value={item.degree}
                    onChange={(e) => onChange({ ...item, degree: e.target.value })}
                    placeholder="Degree"
                  />
                </div>
              )}
            />
          </section>

          {/* Certifications */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Certifications</h2>
            <ListEditor
              items={data.certifications.value}
              onChange={(value) => setData({ ...data, certifications: { ...data.certifications, value } })}
              emptyItem={() => ""}
              addLabel="Add certification"
              renderItem={(item, _, onChange) => (
                <input
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  value={item}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="e.g. Google Analytics Certification"
                />
              )}
            />
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
