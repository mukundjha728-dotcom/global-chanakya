import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ArrowUpRight, Crown, Globe, Shield, Clock,
  TrendingUp, Eye, Heart, Bookmark, ChevronRight, Crosshair,
  Newspaper, BarChart3, Users, Lock, Flame
} from "lucide-react";
import { getTrendingBlogs, getLatestBlogs } from "@/lib/trending";
import type { TrendingBlog } from "@/lib/trending";

export const revalidate = 300;

const pillars = [
  {
    icon: Clock,
    title: "24-Hour Early Access",
    desc: "Premium subscribers read every report a full day before it goes public.",
    accent: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
  },
  {
    icon: Globe,
    title: "Global Coverage",
    desc: "Indo-Pacific, Middle East, Europe, Americas — every strategic theatre.",
    accent: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
  },
  {
    icon: Crosshair,
    title: "Expert Analysis",
    desc: "Unvarnished, non-partisan intelligence briefs by domain specialists.",
    accent: "from-red-500/20 to-red-600/5",
    iconColor: "text-red-400",
  },
  {
    icon: Shield,
    title: "Trusted Platform",
    desc: "Enterprise-grade security with Razorpay-powered premium subscriptions.",
    accent: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
  },
];

const theatres = [
  "Geopolitics", "Indo-Pacific", "South Asia", "Middle East",
  "Defence", "China", "Russia", "Economy & Trade",
];

function BlogCard({ blog, variant = "default", isViral = false }: { blog: TrendingBlog; variant?: "featured" | "default"; isViral?: boolean }) {
  const isPremium = blog.visibility === "premium";
  const isFeatured = variant === "featured";

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 ${
        isFeatured
          ? "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14] hover:shadow-xl hover:shadow-black/40"
          : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/30"
      }`}
    >
      {/* Image */}
      {blog.featuredImage ? (
        <div className={`relative overflow-hidden ${isFeatured ? "aspect-[16/9]" : "aspect-[16/8]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/30 to-transparent" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-neutral-300 border border-white/10">
              {blog.category}
            </span>
          </div>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isViral ? (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-orange-600/90 text-white text-[10px] font-bold uppercase tracking-wide">
                <Flame className="w-2.5 h-2.5" /> Viral
              </span>
            ) : blog.isTrending && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wide">
                <TrendingUp className="w-2.5 h-2.5" /> Trending
              </span>
            )}
            {isPremium && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold backdrop-blur-sm">
                <Crown className="w-2.5 h-2.5" /> Premium
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className={`relative flex items-center justify-center bg-gradient-to-br from-neutral-900 to-[#060606] ${isFeatured ? "aspect-[16/9]" : "aspect-[16/8]"}`}>
          <Newspaper className="w-10 h-10 text-neutral-800" />
          <div className="absolute top-4 left-4">
            <span className="px-2.5 py-1 rounded-md bg-white/[0.06] text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
              {blog.category}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        {isPremium && (
          <div className="flex items-center gap-1 text-amber-400/80 text-[10px] font-medium">
            <Lock className="w-2.5 h-2.5" />
            Early Access
          </div>
        )}

        <h3 className={`font-semibold leading-snug text-white group-hover:text-neutral-300 transition-colors line-clamp-2 ${
          isFeatured ? "text-lg" : "text-[15px]"
        }`}>
          {blog.title}
        </h3>

        <p className="text-neutral-500 text-[13px] leading-relaxed line-clamp-2 flex-1">
          {blog.excerpt}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 pt-3 border-t border-white/[0.05] text-[11px] text-neutral-600">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {(blog.analytics?.views ?? 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {blog.analytics?.likes ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="w-3 h-3" />
            {blog.analytics?.bookmarks ?? 0}
          </span>
          <span className="ml-auto">
            {new Date(blog.publishAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  const [trendingBlogs, latestBlogs] = await Promise.all([
    getTrendingBlogs(6),
    getLatestBlogs(6),
  ]);

  const allBlogs = [...trendingBlogs, ...latestBlogs];
  const mostViewedBlog = allBlogs.length > 0 
    ? allBlogs.reduce((max, blog) => (blog.analytics?.views || 0) > (max.analytics?.views || 0) ? blog : max, allBlogs[0])
    : null;

  const mostViewedBlogId = mostViewedBlog?._id;
  const featuredBlog = mostViewedBlog || latestBlogs[0] || trendingBlogs[0];

  const hasTrending = trendingBlogs.length > 0;
  const sideTrending = trendingBlogs.slice(1, 4);
  const restTrending = trendingBlogs.slice(4);

  return (
    <div className="bg-[#060606] text-white">

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 px-6 overflow-hidden">
        {/* Subtle gradient orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/[0.06] blur-[140px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-neutral-400 text-[11px] font-medium uppercase tracking-[0.08em] w-fit">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600" />
                </span>
                Live Intelligence Desk
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.1] tracking-[-0.03em]">
                Strategic Intelligence,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-orange-400">
                  Delivered Daily.
                </span>
              </h1>

              <p className="text-[17px] text-neutral-400 leading-relaxed max-w-lg">
                In-depth analysis of global geopolitics, defence strategy, and foreign policy. 
                Premium subscribers receive every report 24 hours before public release.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/subscribe"
                  className="group px-6 py-3 bg-white text-[#060606] text-[14px] font-semibold rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  Start Reading
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/blogs"
                  className="px-6 py-3 border border-white/[0.1] text-[14px] font-medium text-neutral-300 rounded-lg hover:bg-white/[0.04] hover:border-white/[0.15] transition-all"
                >
                  Browse Reports
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-2 text-[12px] text-neutral-600">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-neutral-500" />
                  Secure Payments
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-500" />
                  Auto-expiry, No Trap
                </span>
              </div>
            </div>

            {/* Right — Featured article */}
            {featuredBlog ? (
              <Link
                href={`/blogs/${featuredBlog.slug}`}
                className="relative w-full aspect-[4/3] rounded-2xl border border-white/[0.08] bg-neutral-900 overflow-hidden group"
              >
                {featuredBlog.featuredImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-700"
                    style={{ backgroundImage: `url('${featuredBlog.featuredImage}')` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/60 to-transparent" />

                <div className="absolute top-5 left-5 flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-600/90 text-white text-[10px] font-bold uppercase tracking-wide">
                    <Flame className="w-3 h-3" /> Viral
                  </span>
                  {featuredBlog.visibility === "premium" && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold backdrop-blur-sm">
                      <Crown className="w-3 h-3" /> Premium
                    </span>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 w-full p-7 flex flex-col gap-2.5">
                  <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">
                    {featuredBlog.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold leading-tight text-white">
                    {featuredBlog.title}
                  </h3>
                  <p className="text-neutral-400 text-[13px] line-clamp-2 max-w-md">
                    {featuredBlog.excerpt}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                      <Eye className="w-3 h-3" />
                      {(featuredBlog.analytics?.views ?? 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                      <Heart className="w-3 h-3" />
                      {featuredBlog.analytics?.likes ?? 0}
                    </span>
                    <span className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-md text-[11px] font-medium backdrop-blur-sm text-white group-hover:bg-white/15 transition-colors">
                      Read Now
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative w-full aspect-[4/3] rounded-2xl border border-white/[0.06] bg-white/[0.015] overflow-hidden flex flex-col items-center justify-center gap-5 p-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/[0.08] border border-red-500/15 flex items-center justify-center">
                  <Newspaper className="w-7 h-7 text-red-500/50" />
                </div>
                <h3 className="text-lg font-semibold text-white">First Report Coming Soon</h3>
                <p className="text-neutral-500 text-[13px] max-w-xs">
                  Our editorial team is preparing the first batch of intelligence briefs.
                </p>
                <Link
                  href="/subscribe"
                  className="px-5 py-2.5 rounded-lg bg-white text-[#060606] text-[13px] font-semibold hover:bg-neutral-200 transition-colors flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  Get Early Access
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── TRENDING ─── */}
      {hasTrending && (
        <section className="py-20 px-6" id="trending">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-red-500" />
                  <span className="text-red-400 text-[11px] font-semibold uppercase tracking-[0.08em]">
                    Trending Now
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  Most Read This Week
                </h2>
              </div>
              <Link
                href="/blogs"
                className="hidden sm:flex items-center gap-1.5 text-neutral-500 text-[13px] font-medium hover:text-white transition-colors"
              >
                All reports
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Grid */}
            <div className="grid lg:grid-cols-3 gap-5 mb-5">
              {trendingBlogs[0] && (
                <div className="lg:col-span-2">
                  <BlogCard blog={trendingBlogs[0]} variant="featured" isViral={trendingBlogs[0]._id === mostViewedBlogId} />
                </div>
              )}
              <div className="flex flex-col gap-5">
                {sideTrending.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} isViral={blog._id === mostViewedBlogId} />
                ))}
              </div>
            </div>

            {restTrending.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {restTrending.map((blog) => (
                  <BlogCard key={blog._id} blog={blog} isViral={blog._id === mostViewedBlogId} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── LATEST ─── */}
      {latestBlogs.length > 0 && (
        <section className="py-16 px-6 border-t border-white/[0.05]" id="latest">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-white">Latest Reports</h2>
              <Link
                href="/blogs"
                className="text-neutral-500 text-[13px] font-medium hover:text-white transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestBlogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} isViral={blog._id === mostViewedBlogId} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── WHY GLOBAL CHANAKYA ─── */}
      <section className="py-24 px-6 border-t border-white/[0.05]" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-lg border border-white/[0.08] bg-white/[0.03] text-neutral-400 text-[11px] font-medium uppercase tracking-[0.08em] mb-4">
              Why Global Chanakya
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Intelligence You Can Act On
            </h2>
            <p className="text-neutral-500 text-[15px] max-w-xl mx-auto">
              Built for analysts, policy enthusiasts, and decision-makers who need clarity on a complex world.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="p-6 rounded-2xl border border-white/[0.06] bg-white/[0.015] hover:border-white/[0.1] transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${p.accent} flex items-center justify-center mb-5 ${p.iconColor}`}>
                  <p.icon className="w-5 h-5" />
                </div>
                <h3 className="text-[15px] font-semibold text-white mb-2">{p.title}</h3>
                <p className="text-[13px] text-neutral-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ─── */}
      <section className="py-16 px-6 border-t border-white/[0.05]" id="categories">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Browse by Theatre</h2>
            <p className="text-neutral-500 text-[14px]">Explore reports by strategic region and topic</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {theatres.map((cat) => (
              <Link
                key={cat}
                href={`/blogs?category=${encodeURIComponent(cat)}`}
                className="px-5 py-2.5 rounded-lg border border-white/[0.08] text-[13px] font-medium text-neutral-400 hover:text-white hover:border-white/[0.15] hover:bg-white/[0.03] transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PREMIUM CTA ─── */}
      <section className="py-24 px-6 border-t border-white/[0.05]" id="subscribe">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-amber-500/15 bg-amber-500/[0.05] text-amber-400 text-[11px] font-semibold uppercase tracking-[0.08em] mb-6">
            <Crown className="w-3 h-3" />
            Premium Access
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
            Read It First. Every Time.
          </h2>
          <p className="text-neutral-400 text-[16px] leading-relaxed mb-10 max-w-lg mx-auto">
            For just ₹19, unlock 7-day premium access to every report — 24 hours before public release. 
            Auto-expires. No subscription trap.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/subscribe"
              className="group px-7 py-3.5 bg-white text-[#060606] rounded-lg font-semibold text-[14px] flex items-center justify-center gap-2 hover:bg-neutral-200 transition-colors"
            >
              <Crown className="w-4 h-4" />
              Get Premium — ₹19
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/blogs"
              className="px-7 py-3.5 border border-white/[0.1] rounded-lg font-medium text-[14px] text-neutral-300 hover:bg-white/[0.04] transition-all"
            >
              Browse Free Reports
            </Link>
          </div>

          {/* Gating preview */}
          <div className="mt-14 p-6 rounded-2xl border border-white/[0.06] bg-white/[0.015] text-left relative overflow-hidden">
            <div className="absolute top-5 right-5 flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase tracking-wider">
              <Lock className="w-2.5 h-2.5" />
              Premium
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-red-400 font-mono mb-3">
              <Lock className="w-3 h-3" />
              EARLY ACCESS — 17h 42m remaining
            </div>
            <h4 className="text-[16px] font-semibold text-white mb-2">
              China&apos;s Dual Circulation Strategy and the Future of Global Trade
            </h4>
            <p className="text-[13px] text-neutral-600 line-clamp-3">
              An in-depth look at how Beijing&apos;s internal-external economic pivot is reshaping supply chains 
              across Southeast Asia and its implications for Indian exporters...
            </p>
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#060606] to-transparent" />
            <div className="mt-6 flex items-center gap-2 text-[13px]">
              <Lock className="w-3.5 h-3.5 text-neutral-600" />
              <span className="text-neutral-500">Unlocks publicly in 17h 42m.</span>
              <Link href="/subscribe" className="text-amber-400 hover:text-amber-300 font-medium ml-1">
                Unlock now
                <ArrowUpRight className="w-3 h-3 inline ml-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
