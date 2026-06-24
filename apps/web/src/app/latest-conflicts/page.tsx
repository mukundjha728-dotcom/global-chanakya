import React from "react";
import { Metadata } from "next";
import { TrendingEngine } from "@/components/growth/TrendingEngine";
import { NewsletterForm } from "@/components/growth/NewsletterForm";

export const metadata: Metadata = {
  title: "Latest Global Conflicts & Strategic Alerts",
  description: "Live tracker and strategic intelligence on the latest global conflicts, military movements, and geopolitical tension zones.",
};

// ISR 1 hour
export const revalidate = 3600;

export default function LatestConflictsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <header className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6">Latest Global Conflicts</h1>
        <p className="text-xl text-gray-400">
          Track active escalation zones, military deployments, and strategic fallout in real-time.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          {/* Main content area - In prod, this iterates over Conflict models */}
          <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20">
            <h2 className="text-2xl font-bold text-white mb-2">Escalation in the South China Sea</h2>
            <p className="text-gray-300 mb-6">
              Recent naval maneuvers indicate a shift in the regional power dynamic. Our analysts break down the timeline and potential outcomes.
            </p>
            <button className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold transition-colors">
              Read Intelligence Report
            </button>
          </div>
          
          <div className="p-8 rounded-3xl bg-gray-900/50 border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-2">Eastern Europe Stabilizing?</h2>
            <p className="text-gray-300 mb-6">
              Following the latest diplomatic summit, troop movements suggest a temporary freeze. But the underlying economic war continues.
            </p>
            <button className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 px-6 py-2 rounded-lg font-bold transition-colors">
              Read Intelligence Report
            </button>
          </div>
        </div>
        
        <aside className="space-y-8">
          <TrendingEngine />
          <NewsletterForm type="Conflict Alert" />
        </aside>
      </div>
    </div>
  );
}
