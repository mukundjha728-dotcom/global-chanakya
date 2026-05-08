import Link from "next/link";
import { ArrowRight, Zap, Globe, TrendingUp, Lock, ExternalLink, CheckCircle2, Flame, Eye, Heart, BookmarkIcon } from "lucide-react";
import { getTrendingBlogs, getLatestBlogs } from "@/lib/trending";
import type { TrendingBlog } from "@/lib/trending";

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

const SITE_URL = "https://global-chanakya-web.vercel.app";

const features = [
  { icon: Zap, title: "24-Hour Early Access", desc: "Premium subscribers read every article a full day before public release.", color: "text-amber-400" },
  { icon: Globe, title: "Global Coverage", desc: "Indo-Pacific, Middle East, Europe, Americas — every strategic theatre covered.", color: "text-blue-400" },
  { icon: ShieldAlert, title: "Enterprise Security", desc: "Argon2 auth, JWT rotation, session fingerprinting, CSRF protection.", color: "text-rose-400" },
  { icon: TrendingUp, title: "SEO-First Architecture", desc: "SSR + ISR for Lighthouse 95+ performance and maximum discoverability.", color: "text-emerald-400" },
];

const categories = ["Geopolitics", "Indo-Pacific", "South Asia", "Middle East", "Defence", "China", "Russia", "Economy & Trade"];

const stats = [
  { label: "Premium Subscribers", value: "12,400+" },
  { label: "Published Reports", value: "1,800+" },
  { label: "Monthly Readers", value: "320K+" },
  { label: "Avg. SEO Score", value: "98 / 100" },
];

function BlogCard({ blog, rank }: { blog: TrendingBlog; rank: number }) {
  const isPremium = blog.visibility === "premium";
  const isFeatured = rank === 0;

  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${
        isFeatured
          ? "border-rose-500/20 bg-gradient-to-br from-rose-950/30 to-black hover:border-rose-500/40 hover:shadow-rose-900/20"
          : "border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04] hover:shadow-black/50"
      }`}
    >
      {/* Featured Image */}
      {blog.featuredImage ? (
        <div className={`relative overflow-hidden ${isFeatured ? "aspect-video" : "aspect-[16/7]"}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {/* Badges overlay */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {blog.isTrending && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">
                <Flame className="w-2.5 h-2.5" /> Trending
              </span>
            )}
            {rank < 3 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-black text-[10px] font-bold backdrop-blur-sm">
                #{rank + 1} Top
              </span>
            )}
          </div>
          {isPremium && (
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold backdrop-blur-sm">
              <Zap className="w-2.5 h-2.5" /> PREMIUM
            </div>
          )}
        </div>
      ) : (
        <div className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 to-black ${isFeatured ? "aspect-video" : "aspect-[16/7]"}`}>
          <Globe className="w-12 h-12 text-gray-800" />
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {blog.isTrending && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/90 text-white text-[10px] font-bold uppercase tracking-wide">
                <Flame className="w-2.5 h-2.5" /> Trending
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[10px] font-semibold uppercase tracking-wide">
            {blog.category}
          </span>
          {isPremium && (
            <span className="flex items-center gap-1 text-amber-400 text-[10px] font-medium">
              <Lock className="w-2.5 h-2.5" /> Early Access
            </span>
          )}
        </div>

        <h3 className={`font-bold leading-snug text-white group-hover:text-rose-300 transition-colors line-clamp-2 ${isFeatured ? "text-xl" : "text-base"}`}>
          {blog.title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
          {blog.excerpt}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-1 border-t border-white/5">
          <span className="flex items-center gap-1 text-gray-600 text-xs">
            <Eye className="w-3 h-3" />
            {(blog.analytics?.views ?? 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-gray-600 text-xs">
            <Heart className="w-3 h-3" />
            {blog.analytics?.likes ?? 0}
          </span>
          <span className="flex items-center gap-1 text-gray-600 text-xs">
            <BookmarkIcon className="w-3 h-3" />
            {blog.analytics?.bookmarks ?? 0}
          </span>
          <span className="ml-auto text-gray-600 text-xs">
            {new Date(blog.publishAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default async function Home() {
  // Fetch trending + latest blogs in parallel
  const [trendingBlogs, latestBlogs] = await Promise.all([
    getTrendingBlogs(6),
    getLatestBlogs(3),
  ]);

  const hasTrending = trendingBlogs.length > 0;
  const featuredBlog = trendingBlogs[0];
  const sideTrending = trendingBlogs.slice(1, 4);
  const restTrending = trendingBlogs.slice(4);

  return (
    <div className="bg-black text-white selection:bg-rose-900 selection:text-white">

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-rose-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto">
          {/* Live badge */}
          <div className="flex justify-center mb-8">
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-semibold hover:border-emerald-500/40 transition-all"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Now live — global-chanakya-web.vercel.app
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left copy */}
            <div className="flex flex-col gap-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                </span>
                Live Geopolitics Desk
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.08] tracking-tight">
                Deciphering the{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">
                  Global Chessboard.
                </span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                Enterprise-grade geopolitical intelligence, strategy, and unvarnished analysis. Premium subscribers get every report <strong className="text-white">24 hours before</strong> public release.
              </p>

              <ul className="flex flex-col gap-2">
                {["₹19 for 7-day full premium access", "Auto-expiry — zero long-term commitment", "Instant access the moment we publish"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/subscribe"
                  className="px-7 py-3.5 bg-gradient-to-r from-rose-600 to-orange-500 text-white rounded-full font-semibold flex items-center gap-2 group shadow-lg shadow-rose-600/20 hover:shadow-rose-600/40 transition-shadow"
                >
                  Unlock Premium Intel
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/blogs"
                  className="px-7 py-3.5 border border-white/15 rounded-full font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  Read Free Reports
                </Link>
              </div>
            </div>

            {/* Right — Featured trending blog OR static card */}
            {featuredBlog ? (
              <Link
                href={`/blogs/${featuredBlog.slug}`}
                className="relative w-full aspect-[4/3] rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 to-black overflow-hidden group"
              >
                {featuredBlog.featuredImage && (
                  <div
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-45 transition-opacity duration-700 mix-blend-luminosity"
                    style={{ backgroundImage: `url('${featuredBlog.featuredImage}')` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute top-5 left-5 flex items-center gap-2">
                  {featuredBlog.isTrending && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-500/90 text-white text-xs font-bold">
                      <Flame className="w-3 h-3" /> #1 Trending
                    </span>
                  )}
                  {featuredBlog.visibility === "premium" && (
                    <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold backdrop-blur-sm">
                      <Zap className="w-3 h-3" /> PREMIUM
                    </span>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 w-full p-7 flex flex-col gap-3">
                  <span className="text-xs text-gray-400 uppercase tracking-wide font-medium">{featuredBlog.category}</span>
                  <h3 className="text-2xl font-bold leading-tight">{featuredBlog.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{featuredBlog.excerpt}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <span className="flex items-center gap-1 text-gray-400 text-xs"><Eye className="w-3 h-3" /> {(featuredBlog.analytics?.views ?? 0).toLocaleString()}</span>
                    <span className="flex items-center gap-1 text-gray-400 text-xs"><Heart className="w-3 h-3" /> {featuredBlog.analytics?.likes ?? 0}</span>
                    <span className="ml-auto px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">Read Now →</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="relative w-full aspect-[4/3] rounded-3xl border border-white/[0.07] bg-white/[0.02] overflow-hidden flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-2">
                  <Globe className="w-8 h-8 text-rose-500/60" />
                </div>
                <h3 className="text-xl font-bold text-white">First Report Coming Soon</h3>
                <p className="text-gray-500 text-sm max-w-xs">Our editorial team is preparing the first batch of geopolitical intelligence briefs. Subscribe to get notified.</p>
                <Link href="/subscribe" className="mt-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-all flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Get Early Access
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-6 border-y border-white/[0.07]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRENDING BLOGS SECTION ── */}
      {hasTrending && (
        <section className="py-20 px-6" id="trending">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span className="text-rose-400 text-xs font-semibold uppercase tracking-wider">Trending Now</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white">
                  What Readers Are Watching
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Ranked by views, likes & reader engagement — updated every 5 minutes
                </p>
              </div>
              <Link
                href="/blogs"
                className="hidden sm:flex items-center gap-1 text-gray-400 text-sm hover:text-white transition-colors"
              >
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Featured + Side Grid */}
            <div className="grid lg:grid-cols-3 gap-5 mb-5">
              {/* Featured card (rank 1) */}
              {trendingBlogs[0] && (
                <div className="lg:col-span-2">
                  <BlogCard blog={trendingBlogs[0]} rank={0} />
                </div>
              )}
              {/* Side cards (rank 2-3) */}
              <div className="flex flex-col gap-5">
                {sideTrending.map((blog, i) => (
                  <BlogCard key={blog._id} blog={blog} rank={i + 1} />
                ))}
              </div>
            </div>

            {/* Bottom row (rank 4-6) */}
            {restTrending.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {restTrending.map((blog, i) => (
                  <BlogCard key={blog._id} blog={blog} rank={i + 4} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── LATEST ARTICLES ── */}
      {latestBlogs.length > 0 && (
        <section className="py-16 px-6 bg-white/[0.01] border-t border-white/[0.07]" id="latest">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Latest Reports</h2>
              <Link href="/blogs" className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-1">
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestBlogs.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} rank={i + 10} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURES ── */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400 text-xs font-semibold uppercase tracking-wider mb-4">
              Platform Architecture
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">Built for the Modern <br />Intelligence Reader</h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto">Enterprise-grade security, SSR-first SEO, subscription-gated early access — all running on the Vercel edge.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04] transition-all group">
                <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-16 px-6 bg-white/[0.01] border-y border-white/[0.07]" id="categories">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">Browse by Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blogs?category=${encodeURIComponent(cat)}`}
                className="px-5 py-2.5 rounded-full border border-white/10 text-sm text-gray-400 hover:text-white hover:border-rose-500/40 hover:bg-rose-500/5 transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM CTA ── */}
      <section className="py-24 px-6" id="subscribe">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Zap className="w-3 h-3" /> Premium Access
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5">Read It First. <br />Every Time.</h2>
          <p className="text-gray-400 text-lg mb-10">
            For just ₹19, get 7-day premium access to every report — a full 24 hours before public release. Auto-expires. No subscription trap.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/subscribe"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-full font-bold flex items-center justify-center gap-2 group shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-shadow"
            >
              <Zap className="w-5 h-5" />
              Get Premium Access — ₹19
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/blogs"
              className="px-8 py-4 border border-white/15 rounded-full font-semibold text-gray-300 hover:bg-white/5 transition-all"
            >
              Browse Free Articles
            </Link>
          </div>

          {/* Access gating preview */}
          <div className="mt-14 p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] text-left relative overflow-hidden">
            <div className="absolute top-5 right-5 px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase tracking-wide">
              Premium Article
            </div>
            <p className="text-xs text-rose-400 font-mono mb-2 flex items-center gap-1"><Lock className="w-3 h-3" /> EARLY ACCESS — 17h 42m remaining</p>
            <h4 className="text-lg font-bold mb-2">China's Dual Circulation Strategy and the Future of Global Trade</h4>
            <p className="text-sm text-gray-600 line-clamp-3">An in-depth look at how Beijing's internal-external economic pivot is reshaping supply chains across Southeast Asia and its implications for Indian exporters...</p>
            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black to-transparent" />
            <div className="mt-6 flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4 text-gray-600" />
              <span className="text-gray-500">This article becomes public in 17h 42m. </span>
              <Link href="/subscribe" className="text-amber-400 hover:text-amber-300 font-medium">Unlock now →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
