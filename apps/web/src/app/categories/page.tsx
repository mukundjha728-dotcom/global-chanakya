import Link from "next/link";
import { Crosshair, ArrowRight } from "lucide-react";
import { BLOG_CATEGORIES } from "@/constants";

export const metadata = {
  title: "Intelligence Sectors & Categories",
  description: "Browse Global Chanakya intelligence reports by category and strategic theatre.",
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 px-6 md:px-8 bg-[var(--bg)] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--gold)]/5 blur-[100px] rounded-full pointer-events-none" />
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--gold)] text-[11px] font-bold uppercase tracking-widest mb-6 relative z-10 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Crosshair className="w-3.5 h-3.5" /> Intelligence Sectors
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-[-0.02em] relative z-10">Browse Strategic Theatres</h1>
          <p className="text-[var(--secondary)] text-[18px] max-w-2xl mx-auto font-medium leading-[1.8] relative z-10 border-l-2 border-[var(--gold)] pl-4">
            Explore our comprehensive geopolitical coverage across key regions, strategic domains, and intelligence sectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/blogs?category=${encodeURIComponent(cat)}`}
              className="p-6 rounded-sm glass-card hover:border-[var(--gold)] hover:bg-[var(--surface)] hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-between">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">{cat}</h3>
                <ArrowRight className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--gold)] group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
