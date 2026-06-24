"use client";

import React from "react";
import { Twitter, Linkedin, Link2, Quote } from "lucide-react";

interface ShareEngineProps {
  url: string;
  title: string;
  summary: string;
}

export function ShareEngine({ url, title, summary }: ShareEngineProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(`Intelligence Brief: ${summary}`);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    // Ideally trigger a toast notification here
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2 hidden sm:block">Share Intel</span>
      
      <a 
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-blue-500 transition-colors"
        aria-label="Share to Twitter"
      >
        <Twitter className="w-4 h-4" />
      </a>
      
      <a 
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedSummary}&source=GlobalChanakya`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-blue-700 transition-colors"
        aria-label="Share to LinkedIn"
      >
        <Linkedin className="w-4 h-4" />
      </a>

      <button 
        onClick={handleCopyLink}
        className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-emerald-500 transition-colors"
        aria-label="Copy Link"
      >
        <Link2 className="w-4 h-4" />
      </button>

      {/* Quote Snapshot Engine Button - Advanced Feature */}
      <button 
        className="p-2 rounded-full border border-gray-700 bg-gray-900 text-blue-400 hover:text-white hover:bg-blue-600 transition-colors ml-2 flex items-center gap-1 sm:px-3"
        aria-label="Generate Quote Snapshot"
      >
        <Quote className="w-4 h-4" />
        <span className="text-xs font-bold hidden sm:block">Snapshot</span>
      </button>
    </div>
  );
}
