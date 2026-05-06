import Link from "next/link";
import { Folder, ArrowRight } from "lucide-react";
import { BLOG_CATEGORIES } from "@/constants";

export const metadata = {
  title: "Categories",
  description: "Browse Global Chanakya intelligence reports by category.",
};

export default function CategoriesPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Folder className="w-3.5 h-3.5" /> Intelligence Sectors
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">Browse by Category</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore our comprehensive geopolitical coverage across key regions, strategic domains, and intelligence sectors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BLOG_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/blogs?category=${encodeURIComponent(cat)}`}
              className="p-6 rounded-2xl border border-white/[0.08] bg-[#0a0a0a] hover:border-rose-500/40 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">{cat}</h3>
                <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
