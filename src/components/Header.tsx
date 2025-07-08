"use client";
import React from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="w-full bg-white border-b shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            aria-label="Open menu"
            className="p-2 rounded hover:bg-gray-100 focus:outline-none"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {/* Burger icon */}
            <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-800 mb-1"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
          </button>
          <span className="font-bold text-lg text-blue-900">Resume Builder</span>
        </div>
      </div>
      {/* Burger menu dropdown */}
      {menuOpen && (
        <nav className="absolute left-0 top-14 w-56 bg-white border-r shadow-lg z-50 animate-fade-in">
          <ul className="flex flex-col py-2">
            <li>
              <Link href="/" className="block px-6 py-3 hover:bg-blue-50 text-blue-900 font-medium" onClick={() => setMenuOpen(false)}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/customize" className="block px-6 py-3 hover:bg-blue-50 text-blue-900 font-medium" onClick={() => setMenuOpen(false)}>
                Customize
              </Link>
            </li>
            <li>
              <Link href="/archive" className="block px-6 py-3 hover:bg-blue-50 text-blue-900 font-medium" onClick={() => setMenuOpen(false)}>
                Resume Archive
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
} 