import Link from "next/link";
import { Filter, Search, Calendar, ArrowRight } from "lucide-react";
import { CONFLICTS_DATA, TIMELINE_EVENTS } from "@/constants/conflicts";

export const metadata = {
  title: "Active Conflicts | Global Chanakya Intelligence",
  description: "Live tracking of global geopolitical conflicts, military movements, and threat assessments.",
};

export default function ConflictsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-[var(--border)] strategic-grid py-20 lg:py-28">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--danger)]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-8 relative z-10">
          <div className="flex flex-col max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--danger)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse" />
              Live Threat Matrix
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-[1] tracking-[-0.03em] text-white mb-6">
              Active Global <span className="text-[var(--danger)]">Conflicts</span>
            </h1>
            <p className="text-lg lg:text-xl text-white opacity-85 leading-[1.7] font-medium mb-10">
              Real-time monitoring of geopolitical hotspots, military escalations, and regional instability. Updated by field analysts and OSINT streams.
            </p>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)]/30">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border)]">
            <div className="py-8 px-4 flex flex-col gap-2">
              <div className="text-4xl font-bold text-white">24</div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Active Theatres</div>
            </div>
            <div className="py-8 px-4 flex flex-col gap-2 pl-8">
              <div className="text-4xl font-bold text-[var(--danger)]">12</div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">High Risk</div>
            </div>
            <div className="py-8 px-4 flex flex-col gap-2 pl-8">
              <div className="text-4xl font-bold text-[var(--gold)]">7</div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Escalating</div>
            </div>
            <div className="py-8 px-4 flex flex-col gap-2 pl-8">
              <div className="text-4xl font-bold text-white">142</div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Intel Briefs</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FILTERS ─── */}
      <section className="py-8 border-b border-[var(--border)] bg-[var(--bg)] sticky top-20 z-40">
        <div className="container mx-auto max-w-7xl px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
            <input
              type="text"
              placeholder="Search conflicts by region or keyword..."
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--cyan)] transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--gold)] whitespace-nowrap">
              <Filter className="w-3.5 h-3.5" /> All Regions
            </button>
            <button className="px-4 py-2 intel-border rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-white hover:bg-[var(--surface)] transition-colors whitespace-nowrap">
              High Risk
            </button>
            <button className="px-4 py-2 intel-border rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-white hover:bg-[var(--surface)] transition-colors whitespace-nowrap">
              Escalating
            </button>
          </div>
        </div>
      </section>

      {/* ─── CONTENT GRID & TIMELINE ─── */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* LEFT: CARDS (2fr equivalent) */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {CONFLICTS_DATA.map((conflict) => (
                <div key={conflict.id} className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl glass-card border border-[var(--border)] hover:border-[var(--danger)]/30 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="w-full sm:w-[240px] aspect-[4/3] rounded-xl bg-[var(--surface)] overflow-hidden relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={conflict.image} alt={conflict.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent opacity-80 z-10" />
                    <span className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded text-white text-[9px] font-bold uppercase tracking-wider ${conflict.threatLevel === "Critical" ? "bg-[var(--danger)]" : conflict.threatLevel === "Escalating" ? "bg-[var(--gold)]" : "bg-[var(--surface)] border border-[var(--border)]"}`}>
                      {conflict.threatLevel}
                    </span>
                  </div>
                  <div className="flex flex-col flex-1 py-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--danger)]">{conflict.region}</span>
                      <span className="text-[var(--border)] text-[10px]">|</span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Updated {conflict.updatedAt}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[var(--danger)] transition-colors line-clamp-2 leading-[1.3]">
                      {conflict.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)] line-clamp-2 leading-[1.6] mb-4 flex-1">
                      {conflict.summary}
                    </p>
                    <Link href={`/conflicts/${conflict.slug}`} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--cyan)] hover:text-white transition-colors w-fit mt-auto">
                      Read Brief <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* RIGHT: TIMELINE (1fr equivalent) */}
            <div className="lg:col-span-1">
              <div className="sticky top-40 glass-card rounded-2xl p-8 border border-[var(--border)]">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--border)]">
                  <Calendar className="w-5 h-5 text-[var(--cyan)]" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Live Escalation</h3>
                </div>
                
                <div className="flex flex-col gap-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border)]">
                  {TIMELINE_EVENTS.map((event) => (
                    <div key={event.id} className="relative pl-8">
                      <div className={`absolute left-0 top-1 w-6 h-6 rounded-full bg-[var(--bg)] border-2 flex items-center justify-center z-10 ${event.severity === "critical" ? "border-[var(--danger)]" : event.severity === "high" ? "border-[var(--gold)]" : "border-[var(--cyan)]"}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${event.severity === "critical" ? "bg-[var(--danger)]" : event.severity === "high" ? "bg-[var(--gold)]" : "bg-[var(--cyan)]"}`} />
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] mb-1">{event.timestamp}</div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest mb-2 border ${event.severity === "critical" ? "bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20" : "bg-[var(--surface)] text-white border-[var(--border)]"}`}>
                        {event.type}
                      </span>
                      <h4 className="text-sm font-bold text-white leading-[1.4] hover:text-[var(--cyan)] cursor-pointer transition-colors">
                        {event.description}
                      </h4>
                    </div>
                  ))}
                </div>
                
                <button className="w-full mt-8 py-3 intel-border rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--surface)] transition-colors">
                  View Full Timeline
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
