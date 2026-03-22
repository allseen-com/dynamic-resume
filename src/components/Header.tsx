"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type HeaderProps = {
  showToolingNav: boolean;
  toolingProtectionEnabled: boolean;
};

export default function Header({ showToolingNav, toolingProtectionEnabled }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const isPublicMinimalChrome = pathname === "/" || pathname === "/unlock";

  if (isPublicMinimalChrome) {
    return (
      <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 min-w-0" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl text-slate-900 truncate">Meysam Soheilipour</span>
          </Link>
          <span className="text-sm text-slate-500 hidden sm:block shrink-0">
            {pathname === "/unlock" ? "Tooling unlock" : "Resume"}
          </span>
        </div>
      </header>
    );
  }

  if (toolingProtectionEnabled && !showToolingNav) {
    return (
      <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 min-w-0" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl text-slate-900 truncate">Meysam Soheilipour</span>
          </Link>
          <Link href="/unlock" className="text-sm text-indigo-600 hover:text-indigo-800 shrink-0">
            Unlock tooling
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            aria-label="Open menu"
            className="p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-slate-600 transition-all duration-300"></span>
              <span className="block w-6 h-0.5 bg-slate-600 transition-all duration-300"></span>
              <span className="block w-6 h-0.5 bg-slate-600 transition-all duration-300"></span>
            </div>
          </button>
          <Link href="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl text-slate-900">Resume Builder</span>
          </Link>
        </div>
        <div className="text-sm text-slate-600 hidden sm:block">AI-Powered Resume Optimization</div>
      </div>
      {menuOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-20 z-40" onClick={() => setMenuOpen(false)} />
          <nav className="absolute left-0 top-full w-64 bg-white border border-slate-200 shadow-xl rounded-lg z-50 m-2 animate-in slide-in-from-left-2 duration-200">
            <ul className="flex flex-col py-2">
              <li>
                <Link
                  href="/"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">📄</span>
                  Public resume
                </Link>
              </li>
              <li>
                <Link
                  href="/optimize"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">🏠</span>
                  Optimize hub
                </Link>
              </li>
              <li>
                <Link
                  href="/archive"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">📁</span>
                  Resume archive
                </Link>
              </li>
              <li>
                <Link
                  href="/mother-resume"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">📝</span>
                  Mother resume (tools)
                </Link>
              </li>
              <li>
                <Link
                  href="/dynamic-resume"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">✨</span>
                  Dynamic resume
                </Link>
              </li>
              <li>
                <Link
                  href="/side-by-side"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">⚖️</span>
                  Side by side
                </Link>
              </li>
              <li>
                <Link
                  href="/customize"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">🎯</span>
                  Customize
                </Link>
              </li>
              <div className="border-t border-slate-200 my-2" />
              <li>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-700 font-medium transition-colors text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-base">⚙️</span>
                  Settings
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-700 font-medium transition-colors text-sm"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-base">🔒</span>
                  Admin
                </Link>
              </li>
              {toolingProtectionEnabled && (
                <li>
                  <Link
                    href="/unlock"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-slate-600 hover:text-slate-700 font-medium transition-colors text-sm"
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className="text-base">🔑</span>
                    Unlock tooling
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
}
