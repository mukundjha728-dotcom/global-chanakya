import Link from "next/link";
import { Globe, Search, Filter, ArrowRight, Clock, Target, BarChart3, Activity } from "lucide-react";
import { RegionService } from "@/modules/geo/services/region.service";
import EmptyState from "@/components/shared/EmptyState";
import { formatDistanceToNow } from "date-fns";

export const metadata = {
  title: "Strategic Regions | Global Chanakya Intelligence",
  description: "Geopolitical analysis and reports segmented by global strategic theatres.",
};

export default async function RegionsPage() {
  const regions = await RegionService.getAllRegions();
  
  // Hardcode strategic shifts to empty for now as it's not implemented dynamically yet
  const strategicShifts: any[] = []; 

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-[var(--border)] strategic-grid py-20 lg:py-28">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--blue)]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="container mx-auto max-w-7xl px-8 relative z-10">
          <div className="flex flex-col max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 shadow-sm">
              <Globe className="w-4 h-4" />
              Global Theatres
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-[1] tracking-[-0.03em] text-white mb-6">
              Strategic <span className="text-[var(--gold)]">Regions</span>
            </h1>
            <p className="text-lg lg:text-xl text-white opacity-85 leading-[1.7] font-medium mb-10">
              Navigate intelligence briefs, economic shifts, and defense posturing across the world's most critical geopolitical theatres.
            </p>
          </div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="border-b border-[var(--border)] bg-[var(--surface)]/30">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[var(--border)]">
            <div className="py-8 px-4 flex flex-col gap-2">
              <div className="text-4xl font-bold text-white">8</div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Primary Theatres</div>
            </div>
            <div className="py-8 px-4 flex flex-col gap-2 pl-8">
              <div className="text-4xl font-bold text-white">192</div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Nations Monitored</div>
            </div>
            <div className="py-8 px-4 flex flex-col gap-2 pl-8">
              <div className="text-4xl font-bold text-[var(--danger)]">3</div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Volatile Zones</div>
            </div>
            <div className="py-8 px-4 flex flex-col gap-2 pl-8">
              <div className="text-4xl font-bold text-[var(--cyan)]">24/7</div>
              <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">OSINT Coverage</div>
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
              placeholder="Search specific countries or regions..."
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--cyan)] transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--gold)] whitespace-nowrap">
              <Filter className="w-3.5 h-3.5" /> All Theatres
            </button>
            <button className="px-4 py-2 intel-border rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-white hover:bg-[var(--surface)] transition-colors whitespace-nowrap">
              Indo-Pacific
            </button>
            <button className="px-4 py-2 intel-border rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-white hover:bg-[var(--surface)] transition-colors whitespace-nowrap">
              Middle East
            </button>
            <button className="px-4 py-2 intel-border rounded-xl text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-white hover:bg-[var(--surface)] transition-colors whitespace-nowrap">
              Europe
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
              {regions.length === 0 ? (
                <EmptyState 
                  title="No Strategic Regions Monitored" 
                  description="Intelligence analysis for global theatres is currently being gathered." 
                />
              ) : (
                regions.map((region) => (
                  <div key={region._id?.toString() || region.slug} className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl glass-card border border-[var(--border)] hover:border-[var(--cyan)]/30 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-full sm:w-[240px] aspect-[4/3] rounded-xl bg-[var(--surface)] overflow-hidden relative shrink-0 border border-[var(--border)] group-hover:border-[var(--cyan)]/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={region.image || "/images/fallback-geopolitics.jpg"} alt={region.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] to-transparent opacity-80 z-10" />
                      <span className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--cyan)] text-[9px] font-bold uppercase tracking-wider">
                        <Target className="w-3 h-3" /> {region.theatre}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 py-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">{region.category}</span>
                        <span className="text-[var(--border)] text-[10px]">|</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)] flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Updated {formatDistanceToNow(new Date(region.updatedAt || new Date()), { addSuffix: true })}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[var(--cyan)] transition-colors line-clamp-2 leading-[1.3]">
                        {region.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)] line-clamp-2 leading-[1.6] mb-4 flex-1">
                        {region.summary}
                      </p>
                      
                      {/* Key Players */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {region.keyPlayers?.map((player) => (
                          <span key={player} className="px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-[9px] font-bold text-[var(--muted)] uppercase tracking-wider">
                            {player}
                          </span>
                        ))}
                      </div>

                      <Link href={`/regions/${region.slug}`} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)] hover:text-white transition-colors w-fit mt-auto">
                        Read Analysis <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* RIGHT: STRATEGIC SHIFTS PANEL (1fr equivalent) */}
            <div className="lg:col-span-1">
              <div className="sticky top-40 glass-card rounded-2xl p-8 border border-[var(--border)]">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--border)]">
                  <BarChart3 className="w-5 h-5 text-[var(--gold)]" />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Strategic Shifts</h3>
                </div>
                
                <div className="flex flex-col gap-6">
                  {strategicShifts.length === 0 ? (
                    <div className="text-xs text-[var(--muted)] italic pl-2">No strategic shifts reported.</div>
                  ) : (
                    strategicShifts.map((shift) => (
                      <div key={shift.id} className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--gold)]/30 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{shift.theatre}</span>
                            <span className="text-sm font-bold text-white">{shift.metric}</span>
                          </div>
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${shift.shift.includes('+') || shift.shift === 'Surge' ? 'bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20' : 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'}`}>
                            {shift.shift}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] leading-[1.6] group-hover:text-white transition-colors">
                          {shift.description}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                
                <button className="w-full mt-8 py-3 intel-border rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-[var(--surface)] transition-colors flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" /> Live Market Data
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
