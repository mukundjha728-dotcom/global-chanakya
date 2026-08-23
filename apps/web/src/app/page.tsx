import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ArrowUpRight, Globe, Shield, Clock,
  TrendingUp, Eye, Heart, Bookmark, ChevronRight, Crosshair,
  Newspaper, Flame, Activity, TriangleAlert
} from "lucide-react";
import { BlogService } from "@/modules/blog/services/blog.service";
import { formatViews } from "@/lib/formatViews";
import type { TrendingBlog } from "@/lib/trending";
import { BannerAd } from "@/components/ads/AdUnit";
import { IntelligenceCard } from "@/components/intelligence/IntelligenceCard";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";
import dbConnect from "@/lib/mongoose";
import { ensureFreshLiveIntelligence } from "@/lib/intelligence/live/demandRefresh";

export const revalidate = 60;

const pillars = [
  {
    icon: Clock,
    title: "Real-Time Reports",
    desc: "Read every intelligence report in real-time as it's published.",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    desc: "Indo-Pacific, Middle East, Europe, Americas — every theatre.",
  },
  {
    icon: Crosshair,
    title: "Expert Analysis",
    desc: "Unvarnished, non-partisan intelligence briefs by specialists.",
  },
  {
    icon: Shield,
    title: "Trusted Platform",
    desc: "Enterprise-grade security architecture for our readership.",
  },
];



function BlogCard({ blog, variant = "default", isViral = false }: { blog: TrendingBlog; variant?: "featured" | "default" | "compact"; isViral?: boolean }) {
  if (variant === "compact") {
    return (
      <Link href={`/blogs/${blog.slug}`} className="group block h-full">
        <article className="flex flex-row items-center sm:items-stretch gap-4 h-full p-3 glass-card rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/40 hover:shadow-lg hover:shadow-[var(--gold)]/10 bg-[var(--surface)]/20">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-xl border border-[var(--border)]/50">
            <Image
              src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
              alt={blog.title || "Geopolitical Intelligence"}
              fill
              sizes="(max-width: 768px) 96px, 128px"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isViral && (
              <div className="absolute top-1.5 left-1.5 bg-[var(--danger)] text-white p-1 rounded shadow-sm">
                 <Flame className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center flex-1 py-1 pr-2">
            <div className="mb-1.5">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)]">
                {blog.category}
              </span>
            </div>
            <h3 className="font-bold text-white text-xs sm:text-sm md:text-base leading-[1.3] mb-2 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
              {blog.title}
            </h3>
            <div className="mt-auto flex items-center justify-between text-[9px] sm:text-[10px] text-[var(--secondary)] uppercase tracking-[0.14em] font-bold">
              <span>{new Date(blog.publishAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/blogs/${blog.slug}`} className="group block h-full min-h-[360px] md:min-h-[440px]">
        <article className="relative flex flex-col h-full glass-card rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-[var(--gold)]/50 hover:shadow-2xl hover:shadow-[var(--gold)]/20">
          <div className="absolute inset-0 bg-[var(--surface)]">
            <Image
              src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
              alt={blog.title || "Geopolitical Intelligence"}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Badges */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 z-20">
            {isViral ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--danger)]/90 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] shadow-[0_0_10px_var(--danger)]">
                <Flame className="w-3.5 h-3.5" /> High Threat
              </span>
            ) : blog.isTrending && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--cyan)]/20 backdrop-blur-md border border-[var(--cyan)]/30 text-[var(--cyan)] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em]">
                <TrendingUp className="w-3.5 h-3.5" /> Trending
              </span>
            )}
          </div>

          <div className="relative z-10 mt-auto p-6 md:p-8 lg:p-12 flex flex-col">
            <div className="mb-4 md:mb-5">
              <span className="inline-block px-3 py-1.5 rounded bg-[var(--cyan)]/10 backdrop-blur-md text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)] border border-[var(--cyan)]/20">
                {blog.category}
              </span>
            </div>
            <h3 className="font-extrabold text-white text-2xl md:text-3xl lg:text-4xl leading-[1.2] mb-4 md:mb-5 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--gold)] group-hover:to-yellow-200 transition-all duration-300 line-clamp-3 drop-shadow-lg">
              {blog.title}
            </h3>
            <p className="text-sm md:text-base lg:text-lg text-white/85 leading-[1.6] line-clamp-2 mb-6 md:mb-8 max-w-3xl drop-shadow-md">
              {blog.excerpt}
            </p>
            <div className="pt-5 md:pt-6 border-t border-white/20 flex items-center justify-between text-[10px] md:text-[11px] text-[var(--secondary)] uppercase tracking-[0.14em] font-bold">
              <div className="flex items-center gap-4 md:gap-6">
                <span className="flex items-center gap-1.5 text-white/80">
                  <Eye className="w-4 h-4" />
                  {formatViews(blog.analytics?.views ?? 0)} Views
                </span>
              </div>
              <span className="text-white/80">
                {new Date(blog.publishAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  // Default Variant
  return (
    <Link href={`/blogs/${blog.slug}`} className="group block h-full">
      <article className="flex flex-col h-full glass-card rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[var(--gold)]/40 hover:shadow-xl hover:shadow-[var(--gold)]/10 bg-[var(--surface)]/20">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
          <Image
            src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
            alt={blog.title || "Geopolitical Intelligence"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 md:top-4 md:right-4 flex items-center gap-2 z-10">
            {isViral ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--danger)]/90 backdrop-blur-md text-white text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em]">
                <Flame className="w-3.5 h-3.5" /> Hot
              </span>
            ) : blog.isTrending && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--cyan)]/90 backdrop-blur-md text-[var(--bg)] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em]">
                <TrendingUp className="w-3.5 h-3.5" /> Trending
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 p-5 md:p-6 lg:p-7">
          <div className="mb-3 md:mb-4">
            <span className="inline-block px-2.5 py-1 rounded bg-[var(--surface)] text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)] border border-[var(--border)]">
              {blog.category}
            </span>
          </div>
          <h3 className="font-bold text-white text-lg md:text-xl leading-[1.3] mb-3 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-xs md:text-sm text-white/75 leading-[1.6] line-clamp-3 flex-1 mb-5 md:mb-6">
            {blog.excerpt}
          </p>
          <div className="mt-auto pt-4 md:pt-5 border-t border-[var(--border)]/50 flex items-center justify-between text-[9px] md:text-[10px] text-[var(--secondary)] uppercase tracking-[0.14em] font-bold">
            <span className="flex items-center gap-1.5 text-white/60">
              <Eye className="w-3.5 h-3.5" />
               {formatViews(blog.analytics?.views ?? 0)}
            </span>
            <span className="text-white/60">
              {new Date(blog.publishAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function Home() {
  await dbConnect();
  
  // Trigger demand-driven refresh safely in the background
  ensureFreshLiveIntelligence().catch(err => console.error("[Home] Demand refresh error:", err));
  
  const theatresPromise = BlogService.getActiveCategories().then(async (categories) => {
    const map = await Promise.all(
      categories.map(async (category) => {
        const blogs = await BlogService.getBlogsByCategory(category, 4);
        return { category, blogs };
      })
    );
    return { theatres: categories, categoryBlogsMap: map };
  });

  const [
    trendingBlogs, 
    latestBlogs, 
    mostViewedBlog7Days, 
    rawLiveEvents,
    theatresData
  ] = await Promise.all([
    BlogService.getTrendingBlogs(6),
    BlogService.getLatestBlogs(6),
    BlogService.getMostViewedBlogPast7Days(),
    IntelligenceEvent.find({ status: "published", enrichmentStatus: "COMPLETED" }).sort({ publishedAt: -1 }).limit(3).lean(),
    theatresPromise
  ]);

  const { theatres, categoryBlogsMap } = theatresData;

  const liveEvents = rawLiveEvents.map((event: any) => ({
    id: event.slug,
    headline: event.title,
    timestamp: event.publishedAt?.toISOString() || new Date().toISOString(),
    region: event.region || "Global",
    topic: event.category || "Intelligence",
    summary: event.summary,
    whyItMatters: event.whyItMatters || "No strategic summary available.",
    indiaImpact: event.indiaImpact || "NEUTRAL",
    riskLevel: event.riskLevel || "LOW",
    confidence: event.confidence || "MODERATE",
    entities: [],
    sourceMetadata: {
      sources: event.sourceNames?.map((name: string, idx: number) => ({
        name,
        url: event.sourceUrls?.[idx],
        publishedTime: event.publishedAt?.toISOString(),
        retrievedTime: event.discoveredAt?.toISOString(),
        type: "Media"
      })) || [],
      sourceCount: event.sourceNames?.length || 1,
      freshness: "Recently Updated",
      methodology: "Real-time AI enriched extraction"
    }
  }));

  const mostViewedBlogId = mostViewedBlog7Days?._id;
  const featuredBlog = mostViewedBlog7Days || latestBlogs[0] || trendingBlogs[0];

  const hasTrending = trendingBlogs.length > 0;
  const sideTrending = trendingBlogs.slice(1, 4); // take exactly 3 for perfect side stack

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-[var(--border)] strategic-grid min-h-[calc(100vh-5rem)] flex items-center py-12 md:py-16 lg:py-20">
        {/* Background glow effects */}
        <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-[var(--cyan)]/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/2 right-0 translate-x-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--surface)] blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 md:px-4 md:py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-6 md:mb-8 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                Real-Time Strategic Intelligence Network
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] md:leading-[0.95] tracking-[-0.03em] text-white max-w-[760px] mb-6 md:mb-8">
                Intelligence That <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[var(--gold)] via-yellow-200 to-[var(--gold)] text-transparent bg-clip-text drop-shadow-sm">Shapes The World.</span>
              </h1>

              <p className="text-lg md:text-xl text-white/90 leading-[1.7] md:leading-[1.8] max-w-[620px] font-medium mb-8 md:mb-10">
                Unvarnished geopolitical analysis, defence strategy, and global power shifts. 
                Built for leaders, analysts, and decision-makers.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
                <Link
                  href="/auth/signup"
                  className="w-full sm:w-auto px-8 py-4 bg-[var(--gold)] text-[var(--bg)] text-sm font-extrabold uppercase tracking-[0.06em] rounded-xl hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/blogs"
                  className="w-full sm:w-auto px-8 py-4 intel-border bg-[var(--surface)] text-sm font-bold uppercase tracking-[0.06em] text-white hover:bg-[var(--elevated)] hover:scale-[1.02] active:scale-[0.98] transition-all rounded-xl text-center"
                >
                  Explore Reports
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-6 md:gap-10 mt-12 md:mt-14 pt-8 border-t border-[var(--border)]">
                <div className="flex flex-col gap-1 md:gap-2">
                  <div className="text-4xl md:text-5xl font-bold text-white leading-none">67+</div>
                  <div className="text-[10px] md:text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Strategic Reports</div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-5 w-full">
              {featuredBlog && (
                <div className="relative w-full aspect-square sm:aspect-[4/5] max-h-[500px] md:max-h-[600px] glass-card rounded-2xl overflow-hidden flex flex-col group border border-[var(--border)] hover:border-[var(--gold)]/40 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(212,175,55,0.2)] transition-all duration-500">
                  <div className="px-5 py-3 md:px-6 md:py-4 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-white flex items-center gap-2">
                      <Crosshair className="w-3.5 h-3.5 md:w-4 md:h-4 text-[var(--cyan)]" /> Intel Brief
                    </span>
                    <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Clearance: Open</span>
                  </div>
                  <Link href={`/blogs/${featuredBlog.slug}`} className="flex-1 relative flex flex-col p-6 md:p-8 justify-end">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-all duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url('${featuredBlog.featuredImage || "/images/fallback-geopolitics.jpg"}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/80 to-[var(--bg)]/10" />
                    
                    <div className="relative z-10 flex flex-col">
                      <span className="mb-3 md:mb-4 inline-block px-3 py-1.5 rounded bg-[var(--danger)]/20 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.14em] text-white border border-[var(--danger)]/30 w-fit backdrop-blur-md">
                        {featuredBlog.category}
                      </span>
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-[1.1] md:leading-[1.2] text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[var(--gold)] group-hover:to-yellow-200 transition-all duration-300 mb-3 md:mb-4 line-clamp-3 drop-shadow-md">
                        {featuredBlog.title}
                      </h3>
                      <p className="text-white/80 text-sm md:text-base line-clamp-2 md:line-clamp-3 leading-[1.6] md:leading-[1.7]">
                        {featuredBlog.excerpt}
                      </p>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </section>

      {/* ─── GLOBAL INTELLIGENCE LIVE (INJECTED) ─── */}
      <section className="py-16 md:py-24 border-b border-[var(--border)] bg-[var(--surface)]/10 relative">
        <div className="container mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 border-b border-[var(--border)] pb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                <TriangleAlert className="w-5 h-5 md:w-6 md:h-6 text-[var(--gold)]" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  Global Intelligence Live
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30 text-[9px] font-bold uppercase tracking-[0.15em] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)]"></span> Live
                  </span>
                </h2>
                <p className="text-[var(--muted)] text-[10px] md:text-sm mt-1 uppercase tracking-[0.14em] font-semibold">Real-time risk assessments & India impact</p>
              </div>
            </div>
            <Link
              href={`/intelligence`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-[var(--elevated)] hover:border-[var(--gold)]/50 transition-all duration-300"
            >
              Open Command Center <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch mb-10">
             {liveEvents.map((item: any) => (
                <IntelligenceCard key={item.id} item={item} />
             ))}
          </div>

          {/* Ask Chanakya CTA */}
          <div className="p-8 rounded-2xl glass-card border border-[var(--gold)]/20 bg-[var(--gold)]/5 flex flex-col md:flex-row items-center justify-between gap-6">
             <div>
               <h3 className="text-xl font-bold text-white mb-2">Have a strategic question?</h3>
               <p className="text-sm text-white/70 max-w-xl">Get a structured geopolitical assessment, scenario timeline, and multi-dimensional India impact analysis.</p>
             </div>
             <Link href="/intelligence/ask" className="shrink-0 px-6 py-3 bg-[var(--gold)] text-[var(--bg)] font-extrabold uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-colors flex items-center gap-2 text-sm">
                Ask Chanakya <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </section>

      {/* ─── TRENDING ─── */}
      {hasTrending && (
        <section className="py-16 md:py-28 border-b border-[var(--border)] bg-[var(--surface)]/20 relative">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--surface)]/50 to-transparent pointer-events-none" />

          <div className="container mx-auto max-w-7xl px-6 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 border-b border-[var(--border)] pb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 md:w-6 md:h-6 text-[var(--cyan)] drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Trending Geopolitical Intelligence</h2>
                  <p className="text-[var(--muted)] text-[10px] md:text-sm mt-1 uppercase tracking-[0.14em] font-semibold">Priority Intelligence</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch">
              <div className="lg:col-span-8 h-full">
                {trendingBlogs[0] && (
                  <BlogCard blog={trendingBlogs[0]} variant="featured" isViral={trendingBlogs[0]._id === mostViewedBlogId} />
                )}
              </div>
              <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6 h-full">
                {sideTrending.map((blog: TrendingBlog) => (
                  <div key={blog._id} className="flex-1 min-h-[120px]">
                    <BlogCard blog={blog} variant="compact" isViral={blog._id === mostViewedBlogId} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── HOMEPAGE AD UNIT 1 ─── */}
      <div className="container mx-auto max-w-7xl px-6 md:px-8 py-4">
        <BannerAd slot="auto" />
      </div>

      {/* ─── LATEST ─── */}
      {latestBlogs.length > 0 && (
        <section className="py-16 md:py-28 border-b border-[var(--border)] bg-[var(--bg)]">
          <div className="container mx-auto max-w-7xl px-6 md:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 border-b border-[var(--border)] pb-6 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-[var(--cyan)] drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Latest Geopolitical Reports</h2>
                  <p className="text-[var(--muted)] text-[10px] md:text-sm mt-1 uppercase tracking-[0.14em] font-semibold">Real-Time Briefs</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-stretch mb-6 md:mb-8">
              <div className="lg:col-span-8 h-full">
                {latestBlogs[0] && (
                  <BlogCard blog={latestBlogs[0]} variant="featured" isViral={latestBlogs[0]._id === mostViewedBlogId} />
                )}
              </div>
              <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6 h-full">
                {latestBlogs.slice(1, 4).map((blog: TrendingBlog) => (
                  <div key={blog._id} className="flex-1 min-h-[120px]">
                    <BlogCard blog={blog} variant="compact" isViral={blog._id === mostViewedBlogId} />
                  </div>
                ))}
              </div>
            </div>
            {latestBlogs.length > 4 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
                {latestBlogs.slice(4).map((blog: TrendingBlog) => (
                  <div key={blog._id} className="h-full">
                    <BlogCard blog={blog} variant="default" isViral={blog._id === mostViewedBlogId} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── CATEGORY SECTIONS ─── */}
      {categoryBlogsMap.map(({ category, blogs }) => {
        if (!blogs || blogs.length === 0) return null;
        
        return (
          <section key={category} className="py-16 md:py-24 border-b border-[var(--border)] bg-[var(--surface)]/10">
            <div className="container mx-auto max-w-7xl px-6 md:px-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 border-b border-[var(--border)] pb-6 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0">
                    <Newspaper className="w-5 h-5 md:w-6 md:h-6 text-[var(--cyan)] drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{category}</h2>
                    <p className="text-[var(--muted)] text-[10px] md:text-sm mt-1 uppercase tracking-[0.14em] font-semibold">Latest in {category}</p>
                  </div>
                </div>
                <Link
                  href={`/blogs?category=${encodeURIComponent(category)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs font-bold uppercase tracking-[0.06em] text-white hover:bg-[var(--elevated)] hover:border-[var(--cyan)]/50 transition-all duration-300"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 items-stretch">
                {blogs.map((blog: TrendingBlog) => (
                  <div key={blog._id} className="h-full">
                    <BlogCard blog={blog} variant="default" isViral={blog._id === mostViewedBlogId} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      {/* ─── WHY GLOBAL CHANAKYA ─── */}
      <section className="py-16 md:py-28 border-b border-[var(--border)] bg-[var(--surface)]/20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--surface)]/30 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl px-6 md:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/5 text-[var(--gold)] text-[10px] md:text-[11px] font-bold uppercase tracking-[0.14em] mb-6 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              Why Global Chanakya
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 md:mb-6 tracking-tight">
              Intelligence You Can <span className="bg-gradient-to-r from-[var(--cyan)] to-blue-400 text-transparent bg-clip-text">Act On</span>
            </h2>
            <p className="text-white/80 text-lg md:text-xl leading-[1.6] md:leading-[1.8] max-w-2xl mx-auto font-medium">
              Built for analysts, policy enthusiasts, and decision-makers who need clarity on a complex world.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="p-6 md:p-8 rounded-2xl glass-card hover:border-[var(--gold)]/30 hover:-translate-y-2 hover:shadow-[0_15px_30px_-10px_rgba(212,175,55,0.15)] transition-all duration-300 group border border-[var(--border)]"
              >
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[var(--bg)] flex items-center justify-center mb-6 md:mb-8 border border-[var(--border)] transition-all duration-300 group-hover:border-[var(--gold)]/50 group-hover:scale-110 shadow-sm`}>
                  <p.icon className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:text-[var(--gold)] transition-colors" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 tracking-tight group-hover:text-[var(--gold)] transition-colors">{p.title}</h3>
                <p className="text-sm md:text-base text-white/75 leading-[1.6] md:leading-[1.7]">{p.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
             <Link href="/editorial-policy" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--gold)] hover:text-white transition-colors">
                Explore our Trust & Ethics Framework <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES & HUBS ─── */}
      <section className="py-16 md:py-28 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="container mx-auto max-w-7xl px-6 md:px-8">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6 tracking-tight">Strategic Intelligence Hubs</h2>
            <p className="text-[var(--muted)] text-[10px] md:text-sm font-bold uppercase tracking-[0.14em]">Explore our dedicated intelligence centres</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-5xl mx-auto mb-16">

            <Link href="/breaking" className="px-6 py-4 rounded-xl intel-border bg-[var(--surface)] text-xs md:text-sm font-bold uppercase tracking-[0.06em] text-white hover:bg-white hover:text-[var(--bg)] hover:-translate-y-1 transition-all duration-300 text-center flex-1 min-w-[160px]">
              Breaking Intel
            </Link>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4 tracking-tight">Browse by Theatre</h3>
          </div>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
            {theatres.map((cat) => (
              <Link
                key={cat}
                href={`/blogs?category=${encodeURIComponent(cat)}`}
                className="px-5 py-3 md:px-6 md:py-4 rounded-xl intel-border bg-[var(--surface)] text-xs md:text-sm font-bold uppercase tracking-[0.06em] text-white hover:bg-white hover:text-[var(--bg)] hover:scale-[1.05] hover:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.3)] transition-all duration-300 active:scale-[0.98]"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
