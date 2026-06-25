import React from "react";
import { Metadata } from "next";
import { TrendingEngine } from "@/components/growth/TrendingEngine";
import { NewsletterForm } from "@/components/growth/NewsletterForm";
import { ConflictService } from "@/modules/conflict/services/conflict.service";
import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Latest Global Conflicts & Strategic Alerts",
  description: "Live tracker and strategic intelligence on the latest global conflicts, military movements, and geopolitical tension zones.",
};

// ISR 1 hour
export const revalidate = 3600;

export default async function LatestConflictsPage() {
  const conflicts = await ConflictService.getAllConflicts(10);
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
          {conflicts.length === 0 ? (
            <EmptyState 
              title="No Escalation Zones" 
              description="There are currently no major conflicts or escalations to report." 
            />
          ) : (
            conflicts.map((conflict, idx) => (
              <div key={conflict._id?.toString() || conflict.slug} className={`p-8 rounded-3xl border ${idx === 0 ? 'bg-red-500/5 border-red-500/20' : 'bg-gray-900/50 border-gray-800'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${conflict.conflictState === 'Escalating' ? 'bg-red-500/10 text-red-500' : 'bg-gray-800 text-gray-400'}`}>
                    {conflict.conflictState}
                  </span>
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{conflict.regions?.[0] || 'Global'}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{conflict.title}</h2>
                <p className="text-gray-300 mb-6 line-clamp-3">
                  {conflict.overview}
                </p>
                <Link href={`/conflicts/${conflict.slug}`} className={`inline-block px-6 py-2 rounded-lg font-bold transition-colors ${idx === 0 ? 'bg-red-600 hover:bg-red-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'}`}>
                  Read Intelligence Report
                </Link>
              </div>
            ))
          )}
        </div>
        
        <aside className="space-y-8">
          <TrendingEngine />
          <NewsletterForm type="Conflict Alert" />
        </aside>
      </div>
    </div>
  );
}
