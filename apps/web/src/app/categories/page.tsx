import Link from "next/link";
import { Crosshair, ArrowRight } from "lucide-react";
import { BLOG_CATEGORIES } from "@/constants";

export const metadata = {
  title: "Intelligence Sectors & Categories",
  description: "Browse Global Chanakya intelligence reports by category and strategic theatre.",
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-8 bg-[var(--bg)] text-[var(--text)] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-[var(--cyan)]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-[var(--gold)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 relative">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl border border-[var(--cyan)]/30 bg-[var(--cyan)]/10 text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] mb-6 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Crosshair className="w-4 h-4" /> Intelligence Sectors
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-white tracking-[-0.02em] drop-shadow-md">
            Browse Strategic Theatres
          </h1>
          <p className="text-[var(--secondary)] text-lg md:text-xl max-w-2xl mx-auto font-medium leading-[1.8]">
            Explore our comprehensive geopolitical coverage across key regions, strategic domains, and intelligence sectors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/blogs?category=${encodeURIComponent(cat)}`}
              className="p-6 md:p-8 rounded-2xl glass-card border border-[var(--border)] hover:border-[var(--cyan)]/50 hover:bg-[var(--surface)] hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(6,182,212,0.15)] transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[180px]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--cyan)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--cyan)] to-[var(--gold)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--cyan)]/50 group-hover:scale-110 transition-all duration-500 shadow-sm">
                   <Crosshair className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--cyan)] transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-[var(--cyan)] transition-all">
                    {cat}
                  </h3>
                  <div className="flex items-center gap-2 text-[var(--muted)] group-hover:text-[var(--gold)] transition-colors text-xs font-bold uppercase tracking-[0.1em]">
                    View Reports <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
