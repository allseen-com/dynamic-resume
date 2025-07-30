"use client";
import React from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            aria-label="Open menu"
            className="p-2 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {/* Improved burger icon */}
            <div className="space-y-1.5">
              <span className="block w-6 h-0.5 bg-slate-600 transition-all duration-300"></span>
              <span className="block w-6 h-0.5 bg-slate-600 transition-all duration-300"></span>
              <span className="block w-6 h-0.5 bg-slate-600 transition-all duration-300"></span>
            </div>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-xl text-slate-900">Resume Builder</span>
          </div>
        </div>
        <div className="text-sm text-slate-600 hidden sm:block">
          AI-Powered Resume Optimization
        </div>
      </div>
      {/* Improved burger menu dropdown */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-40" 
            onClick={() => setMenuOpen(false)}
          />
          {/* Menu */}
          <nav className="absolute left-0 top-full w-64 bg-white border border-slate-200 shadow-xl rounded-lg z-50 m-2 animate-in slide-in-from-left-2 duration-200">
            <ul className="flex flex-col py-2">
              <li>
                <Link 
                  href="/" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors" 
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">🏠</span>
                  Resume Optimizer
                </Link>
              </li>
              <li>
                <Link 
                  href="/archive" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors" 
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">📁</span>
                  Resume Archive
                </Link>
              </li>
              <li>
                <Link 
                  href="/customize" 
                  className="flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-medium transition-colors" 
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-lg">⚙️</span>
                  Advanced Customization
                </Link>
              </li>
              <div className="border-t border-slate-200 my-2"></div>
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
            </ul>
          </nav>
        </>
      )}
    </header>
  );
} 