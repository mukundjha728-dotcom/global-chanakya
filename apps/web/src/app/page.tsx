import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Globe, Shield, Clock,
  TrendingUp, Eye, Heart, Bookmark, ChevronRight, Crosshair,
  Newspaper, Flame, Activity
} from "lucide-react";
import { BlogService } from "@/modules/blog/services/blog.service";
import type { TrendingBlog } from "@/lib/trending";

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

const theatres = [
  "Geopolitics", "Indo-Pacific", "South Asia", "Middle East",
  "Defence", "China", "Russia", "Economy & Trade",
];

function BlogCard({ blog, variant = "default", isViral = false }: { blog: TrendingBlog; variant?: "featured" | "default" | "compact"; isViral?: boolean }) {
  if (variant === "compact") {
    return (
      <Link href={`/blogs/${blog.slug}`} className="group block h-full">
        <article className="flex items-center gap-4 h-full p-3 glass-card rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--gold)]/30 hover:shadow-lg hover:shadow-[var(--gold)]/10 bg-[var(--surface)]/20">
          <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-xl border border-[var(--border)]/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
              alt={blog.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isViral && (
              <div className="absolute top-2 left-2 bg-[var(--danger)] text-white p-1 rounded-md shadow-sm">
                 <Flame className="w-3 h-3" />
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center flex-1 py-1 pr-2">
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)]">
                {blog.category}
              </span>
            </div>
            <h3 className="font-bold text-white text-sm md:text-base leading-[1.3] mb-2 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
              {blog.title}
            </h3>
            <div className="mt-auto flex items-center justify-between text-[10px] text-[var(--secondary)] uppercase tracking-[0.14em] font-bold">
              <span>{new Date(blog.publishAt).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/blogs/${blog.slug}`} className="group block h-full min-h-[440px]">
        <article className="relative flex flex-col h-full glass-card rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:border-[var(--gold)]/40 hover:shadow-2xl hover:shadow-[var(--gold)]/20">
          <div className="absolute inset-0 bg-[var(--surface)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
              alt={blog.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Badges */}
          <div className="absolute top-6 right-6 flex items-center gap-2 z-20">
            {isViral ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--danger)]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.14em] shadow-[0_0_10px_var(--danger)]">
                <Flame className="w-3.5 h-3.5" /> High Threat
              </span>
            ) : blog.isTrending && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--cyan)]/20 backdrop-blur-md border border-[var(--cyan)]/30 text-[var(--cyan)] text-[10px] font-bold uppercase tracking-[0.14em]">
                <TrendingUp className="w-3.5 h-3.5" /> Trending
              </span>
            )}
          </div>

          <div className="relative z-10 mt-auto p-8 lg:p-12 flex flex-col">
            <div className="mb-5">
              <span className="inline-block px-3 py-1.5 rounded bg-[var(--cyan)]/10 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)] border border-[var(--cyan)]/20">
                {blog.category}
              </span>
            </div>
            <h3 className="font-extrabold text-white text-3xl lg:text-4xl leading-[1.2] mb-5 group-hover:text-[var(--gold)] transition-colors line-clamp-3 drop-shadow-lg">
              {blog.title}
            </h3>
            <p className="text-base lg:text-lg text-white/80 leading-[1.6] line-clamp-2 mb-8 max-w-3xl">
              {blog.excerpt}
            </p>
            <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-[var(--secondary)] uppercase tracking-[0.14em] font-bold">
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2 text-white/70">
                  <Eye className="w-4 h-4" />
                  {(blog.analytics?.views ?? 0).toLocaleString()} Views
                </span>
              </div>
              <span className="text-white/70">
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
      <article className="flex flex-col h-full glass-card rounded-2xl border border-[var(--border)] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-[var(--gold)]/30 hover:shadow-xl hover:shadow-[var(--gold)]/10 bg-[var(--surface)]/20">
        <div className="relative aspect-[16/9] overflow-hidden border-b border-[var(--border)] bg-[var(--surface)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.featuredImage || "/images/fallback-geopolitics.jpg"}
            alt={blog.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            {isViral ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--danger)]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.14em]">
                <Flame className="w-3.5 h-3.5" /> Hot
              </span>
            ) : blog.isTrending && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[var(--cyan)]/90 backdrop-blur-md text-[var(--bg)] text-[10px] font-bold uppercase tracking-[0.14em]">
                <TrendingUp className="w-3.5 h-3.5" /> Trending
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 p-6 lg:p-7">
          <div className="mb-4">
            <span className="inline-block px-2.5 py-1 rounded bg-[var(--surface)] text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--cyan)] border border-[var(--border)]">
              {blog.category}
            </span>
          </div>
          <h3 className="font-bold text-white text-xl leading-[1.3] mb-3 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
            {blog.title}
          </h3>
          <p className="text-sm text-white/70 leading-[1.6] line-clamp-3 flex-1 mb-6">
            {blog.excerpt}
          </p>
          <div className="mt-auto pt-5 border-t border-[var(--border)]/50 flex items-center justify-between text-[10px] text-[var(--secondary)] uppercase tracking-[0.14em] font-bold">
            <span className="flex items-center gap-1.5 text-white/60">
              <Eye className="w-3.5 h-3.5" />
              {(blog.analytics?.views ?? 0).toLocaleString()}
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
  const [trendingBlogs, latestBlogs, mostViewedBlogGlobal] = await Promise.all([
    BlogService.getTrendingBlogs(6),
    BlogService.getLatestBlogs(6),
    BlogService.getMostViewedBlog(),
  ]);

  const mostViewedBlogId = mostViewedBlogGlobal?._id;
  const featuredBlog = mostViewedBlogGlobal || latestBlogs[0] || trendingBlogs[0];

  const hasTrending = trendingBlogs.length > 0;
  const sideTrending = trendingBlogs.slice(1, 4); // take exactly 3 for perfect side stack

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden border-b border-[var(--border)] strategic-grid h-[720px] flex items-center">
        <div className="absolute top-1/2 right-1/4 translate-x-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--surface)] blur-[100px] rounded-full pointer-events-none" />

        <div className="container mx-auto max-w-7xl px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] w-fit mb-8 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse" />
                Real-Time Strategic Intelligence Network
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold leading-[0.95] tracking-[-0.03em] text-white max-w-[760px] mb-8">
                Intelligence That <br />
                <span className="text-[var(--gold)]">Shapes The World.</span>
              </h1>

              <p className="text-xl text-white opacity-85 leading-[1.8] max-w-[620px] font-medium mb-10">
                Unvarnished geopolitical analysis, defence strategy, and global power shifts. 
                Built for leaders, analysts, and decision-makers.
              </p>

              <div className="flex flex-wrap items-center gap-5">
                <Link
                  href="/auth/signup"
                  className="px-8 py-4 bg-[var(--gold)] text-[var(--bg)] text-sm font-extrabold uppercase tracking-[0.06em] rounded-xl hover:opacity-90 transition-opacity flex items-center gap-3"
                >
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/blogs"
                  className="px-8 py-4 intel-border bg-[var(--surface)] text-sm font-bold uppercase tracking-[0.06em] text-white hover:bg-[var(--elevated)] transition-colors rounded-xl"
                >
                  Explore Reports
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-10 mt-14 pt-8 border-t border-[var(--border)]">
                <div className="flex flex-col gap-2">
                  <div className="text-5xl font-bold text-white leading-none">67+</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Strategic Reports</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-5xl font-bold text-white leading-none flex items-center gap-2">
                    24 <span className="w-2.5 h-2.5 rounded-full bg-[var(--cyan)] animate-pulse" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Live Conflicts</div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="text-5xl font-bold text-white leading-none">192</div>
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--muted)] font-bold">Countries Tracked</div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="lg:col-span-5 hidden lg:block">
              {featuredBlog && (
                <div className="relative w-full aspect-[4/5] max-h-[600px] glass-card rounded-2xl overflow-hidden flex flex-col group border border-[var(--border)] hover:border-[var(--gold)]/30 hover:-translate-y-2 transition-all duration-300">
                  <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white flex items-center gap-2">
                      <Crosshair className="w-4 h-4 text-[var(--cyan)]" /> Intel Brief
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Clearance: Open</span>
                  </div>
                  <Link href={`/blogs/${featuredBlog.slug}`} className="flex-1 relative flex flex-col p-8 justify-end">
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-all duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url('${featuredBlog.featuredImage || "/images/fallback-geopolitics.jpg"}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/80 to-[var(--bg)]/10" />
                    
                    <div className="relative z-10 flex flex-col">
                      <span className="mb-4 inline-block px-3 py-1.5 rounded bg-[var(--danger)]/20 text-[10px] font-bold uppercase tracking-[0.14em] text-white border border-[var(--danger)]/30 w-fit backdrop-blur-md">
                        {featuredBlog.category}
                      </span>
                      <h3 className="text-4xl font-bold leading-[1.1] text-white group-hover:text-[var(--gold)] transition-colors mb-4 line-clamp-3">
                        {featuredBlog.title}
                      </h3>
                      <p className="text-white opacity-75 text-base line-clamp-3 leading-[1.7]">
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

      {/* ─── TRENDING ─── */}
      {hasTrending && (
        <section className="py-28 border-b border-[var(--border)] bg-[var(--surface)]/20">
          <div className="container mx-auto max-w-7xl px-8">
            <div className="flex items-center justify-between mb-12 border-b border-[var(--border)] pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <Flame className="w-6 h-6 text-[var(--cyan)]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Most Read This Week</h2>
                  <p className="text-[var(--muted)] text-sm mt-1 uppercase tracking-[0.14em] font-semibold">Priority Intelligence</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-8 h-full">
                {trendingBlogs[0] && (
                  <BlogCard blog={trendingBlogs[0]} variant="featured" isViral={trendingBlogs[0]._id === mostViewedBlogId} />
                )}
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                {sideTrending.map((blog) => (
                  <div key={blog._id} className="flex-1 min-h-[120px]">
                    <BlogCard blog={blog} variant="compact" isViral={blog._id === mostViewedBlogId} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── LATEST ─── */}
      {latestBlogs.length > 0 && (
        <section className="py-28 border-b border-[var(--border)] bg-[var(--bg)]">
          <div className="container mx-auto max-w-7xl px-8">
            <div className="flex items-center justify-between mb-12 border-b border-[var(--border)] pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[var(--cyan)]" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Latest Reports</h2>
                  <p className="text-[var(--muted)] text-sm mt-1 uppercase tracking-[0.14em] font-semibold">Real-Time Briefs</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-8">
              <div className="lg:col-span-8 h-full">
                {latestBlogs[0] && (
                  <BlogCard blog={latestBlogs[0]} variant="featured" isViral={latestBlogs[0]._id === mostViewedBlogId} />
                )}
              </div>
              <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                {latestBlogs.slice(1, 4).map((blog) => (
                  <div key={blog._id} className="flex-1 min-h-[120px]">
                    <BlogCard blog={blog} variant="compact" isViral={blog._id === mostViewedBlogId} />
                  </div>
                ))}
              </div>
            </div>
            {latestBlogs.length > 4 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                {latestBlogs.slice(4).map((blog) => (
                  <div key={blog._id} className="h-full">
                    <BlogCard blog={blog} variant="default" isViral={blog._id === mostViewedBlogId} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── WHY GLOBAL CHANAKYA ─── */}
      <section className="py-28 border-b border-[var(--border)] bg-[var(--surface)]/20">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-2 rounded intel-border bg-[var(--surface)] text-[var(--cyan)] text-[11px] font-bold uppercase tracking-[0.14em] mb-6 shadow-sm">
              Why Global Chanakya
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
              Intelligence You Can Act On
            </h2>
            <p className="text-white opacity-75 text-xl leading-[1.8] max-w-2xl mx-auto font-medium">
              Built for analysts, policy enthusiasts, and decision-makers who need clarity on a complex world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="p-8 rounded-2xl glass-card hover:border-[var(--border)] hover:-translate-y-[8px] transition-all duration-300 group border border-[var(--border)]"
              >
                <div className={`w-14 h-14 rounded-xl bg-[var(--bg)] flex items-center justify-center mb-8 border border-[var(--border)] transition-colors group-hover:border-[var(--cyan)]/50`}>
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-tight">{p.title}</h3>
                <p className="text-base text-white opacity-75 leading-[1.7]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-28 border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="container mx-auto max-w-7xl px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6 tracking-tight">Browse by Theatre</h2>
            <p className="text-[var(--muted)] text-sm font-bold uppercase tracking-[0.14em]">Explore reports by strategic region and topic</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {theatres.map((cat) => (
              <Link
                key={cat}
                href={`/blogs?category=${encodeURIComponent(cat)}`}
                className="px-6 py-4 rounded-xl intel-border bg-[var(--surface)] text-sm font-bold uppercase tracking-[0.06em] text-white hover:bg-white hover:text-[var(--bg)] transition-all duration-300"
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
