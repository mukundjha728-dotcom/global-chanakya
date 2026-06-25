import React from "react";
import { Metadata } from "next";
import { Zap } from "lucide-react";
import { TimelineService } from "@/modules/timeline/services/timeline.service";
import EmptyState from "@/components/shared/EmptyState";
import { formatDistanceToNow } from "date-fns";

export const metadata: Metadata = {
  title: "Breaking Geopolitical Alerts | Global Chanakya",
  description: "Live strategic updates and breaking geopolitical news.",
};

// ISR near real-time (60 seconds)
export const revalidate = 60;

export default async function BreakingNewsPage() {
  const events = await TimelineService.getGlobalRecentEvents(10);
  const criticalEvents = (events as any[]).filter(e => e.severity === 'critical' || e.severity === 'major');

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
        {(events as any[]).length === 0 ? (
          <div className="pl-8 py-8">
            <EmptyState 
              title="No Breaking Alerts" 
              description="The global situation is currently stable. No critical escalations are unfolding at this minute." 
            />
          </div>
        ) : (
          (events as any[]).map((event: any, idx: number) => (
            <div key={event._id?.toString() || idx} className="relative pl-8">
              {idx === 0 && (event.severity === 'critical' || event.severity === 'major') ? (
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              ) : (
                <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-gray-600 border-2 border-gray-950"></div>
              )}
              <time className={`text-xs font-bold uppercase tracking-wider mb-2 block ${idx === 0 && (event.severity === 'critical' || event.severity === 'major') ? 'text-red-400' : 'text-gray-500'}`}>
                {formatDistanceToNow(new Date(event.eventDate), { addSuffix: true })} — {event.entityType.toUpperCase()}
              </time>
              <h2 className={`text-2xl font-bold mb-3 ${idx === 0 && (event.severity === 'critical' || event.severity === 'major') ? 'text-white' : 'text-gray-200'}`}>{event.title}</h2>
              <p className={`${idx === 0 && (event.severity === 'critical' || event.severity === 'major') ? 'text-gray-300' : 'text-gray-400'} leading-relaxed mb-4`}>
                {event.description}
              </p>
              {idx === 0 && (event.severity === 'critical' || event.severity === 'major') && (
                <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-800 text-sm">
                  <strong className="text-blue-400">Analyst Note:</strong> Immediate monitoring advised. Expect updates shortly.
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
