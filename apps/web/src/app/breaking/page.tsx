import React from "react";
import { Metadata } from "next";
import { Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Breaking Geopolitical Alerts | Global Chanakya",
  description: "Live strategic updates and breaking geopolitical news.",
};

// ISR near real-time (60 seconds)
export const revalidate = 60;

export default function BreakingNewsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-12 border-b border-gray-800 pb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
            </span>
            Live Escalation Alerts
          </h1>
          <p className="text-gray-400 mt-2">Real-time updates directly from the Strategic War Room.</p>
        </div>
        <div className="bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Zap className="w-5 h-5" /> Active Liveblog
        </div>
      </header>

      <div className="relative border-l-2 border-red-500/50 ml-4 space-y-12">
        {/* Live Event Marker 1 */}
        <div className="relative pl-8">
          <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
          <time className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 block">
            Just Now — South China Sea
          </time>
          <h2 className="text-2xl font-bold text-white mb-3">Carrier Strike Group Approaches Contested Atoll</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Unverified reports indicate severe radio jamming and advanced electronic warfare deployment within 50 nautical miles of the artificial island cluster.
          </p>
          <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-sm">
            <strong className="text-blue-400">Analyst Note:</strong> This mirrors the 2024 tabletop exercises precisely. Expect immediate diplomatic fallout in Geneva within hours.
          </div>
        </div>

        {/* Live Event Marker 2 */}
        <div className="relative pl-8">
          <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-gray-600 border-2 border-gray-950"></div>
          <time className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
            2 Hours Ago — Middle East
          </time>
          <h2 className="text-xl font-bold text-gray-200 mb-3">Proxy Militia Announces Ceasefire Conditions</h2>
          <p className="text-gray-400 leading-relaxed">
            The unofficial spokesperson released a localized broadcast demanding total blockade lifting. Market analysts report crude oil reacting rapidly (+3%).
          </p>
        </div>
      </div>
    </div>
  );
}
