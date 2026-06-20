import Link from "next/link";
import { Search, ChevronRight, Hash } from "lucide-react";
import { SEO_BLOGS } from "@/constants/platformSeoBlogs";

export const metadata = {
  title: "Global Chanakya Strategic Intelligence Platform | Geopolitical Analysis Hub",
  description: "Explore in-depth geopolitical intelligence, strategic conflict analysis, regional power shifts, global diplomacy, defense strategy, and real-time intelligence insights.",
  keywords: "geopolitical analysis, global conflict intelligence, strategic intelligence platform, india geopolitics, world politics analysis, defense intelligence, foreign policy insights, international relations",
  robots: "index, follow",
};

export default function PlatformSeoIndex() {
  const categories = Array.from(new Set(SEO_BLOGS.map(b => b.category)));
  const latestPosts = [...SEO_BLOGS].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const popularPosts = latestPosts.slice(0, 3); // Mocking popular

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
            Strategic Intelligence <span className="text-[var(--gold)]">Hub</span>
          </h1>
          <p className="text-lg text-[var(--muted)] max-w-2xl leading-relaxed">
            In-depth analysis of global power shifts, defense strategy, and international relations. Read our comprehensive reports below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Feed */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <h2 className="text-2xl font-bold text-white border-b border-[var(--border)] pb-4">Latest Analysis</h2>
            
            <div className="flex flex-col gap-8">
              {latestPosts.map((post) => (
                <article key={post.slug} className="glass-card p-6 rounded-2xl border border-[var(--border)] hover:border-[var(--gold)]/30 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-2.5 py-1 rounded bg-[var(--surface)] text-[10px] font-bold uppercase tracking-wider text-[var(--cyan)]">
                      {post.category}
                    </span>
                    <time className="text-xs font-semibold text-[var(--muted)]">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </time>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3 hover:text-[var(--gold)] transition-colors">
                    <Link href={`/platformseo/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-sm text-[var(--muted)] leading-[1.7] mb-5">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.keywords.slice(0, 3).map((kw) => (
                      <span key={kw} className="text-[11px] font-medium text-[var(--muted)] flex items-center gap-1">
                        <Hash className="w-3 h-3" /> {kw}
                      </span>
                    ))}
                  </div>

                  <Link href={`/platformseo/${post.slug}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)] hover:text-white transition-colors">
                    Read Full Report <ChevronRight className="w-3 h-3" />
                  </Link>
                </article>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            
            {/* Search */}
            <div className="glass-card p-6 rounded-2xl border border-[var(--border)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Search Hub</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                <input 
                  type="text" 
                  placeholder="Search intelligence reports..." 
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[var(--gold)]"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="glass-card p-6 rounded-2xl border border-[var(--border)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Focus Areas</h3>
              <ul className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link href={`/platformseo?category=${cat}`} className="flex items-center justify-between py-2 text-sm text-[var(--muted)] hover:text-[var(--gold)] transition-colors">
                      <span>{cat}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Posts */}
            <div className="glass-card p-6 rounded-2xl border border-[var(--border)]">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Strategic Briefs</h3>
              <div className="flex flex-col gap-4">
                {popularPosts.map((post) => (
                  <Link href={`/platformseo/${post.slug}`} key={post.slug} className="group flex flex-col gap-1 border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                    <h4 className="text-sm font-bold text-white leading-[1.4] group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                      {post.title}
                    </h4>
                    <span className="text-[10px] uppercase tracking-wider text-[var(--cyan)]">{post.category}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
