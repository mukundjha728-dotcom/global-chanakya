import Link from "next/link";
import { ArrowRight, ShieldAlert, Zap, Globe, TrendingUp, Lock, ExternalLink, CheckCircle2 } from "lucide-react";

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

export default function Home() {
  return (
    <div className="bg-black text-white selection:bg-rose-900 selection:text-white">

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-24 px-6 overflow-hidden">
        {/* background glow */}
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

            {/* Right — hero card */}
            <div className="relative w-full aspect-[4/3] rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 to-black overflow-hidden group">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-35 transition-opacity duration-700 mix-blend-luminosity"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              {/* Floating premium badge */}
              <div className="absolute top-5 right-5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold backdrop-blur-sm flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> PREMIUM EARLY ACCESS
              </div>
              <div className="absolute bottom-0 left-0 w-full p-7 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-rose-400 font-mono text-xs">
                  <ShieldAlert className="w-3.5 h-3.5" /> RESTRICTED — PREMIUM ONLY
                </div>
                <h3 className="text-2xl font-bold leading-tight">The Emerging Indo-Pacific Security Architecture</h3>
                <p className="text-gray-400 text-sm line-clamp-2">Strategic realignments in the South China Sea and broader implications for global supply chains.</p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">24h Early Access</span>
                  <span className="text-xs text-gray-500">Unlocks for public tomorrow</span>
                </div>
              </div>
            </div>
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
            {/* blur overlay */}
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
