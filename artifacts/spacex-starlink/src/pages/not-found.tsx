import React from "react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-8xl font-black text-white mb-4">404</h1>
        <p className="text-gray-400 mb-8">Page not found</p>
        <Link href="/" className="text-primary hover:underline font-bold uppercase tracking-widest text-sm">
          Return Home
        </Link>
      </div>
    </div>
  );
}
