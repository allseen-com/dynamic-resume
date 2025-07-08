"use client";
import React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

function NotFoundImpl() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-900 mb-4">404 - Page Not Found</h1>
      <p className="text-lg text-gray-700 mb-8">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Go Home</Link>
    </div>
  );
}

export default dynamic(() => Promise.resolve(NotFoundImpl), { ssr: false }); 