import Link from "next/link";
import { Globe, ExternalLink, Zap, Shield, Rss } from "lucide-react";

const SITE_URL = "https://global-chanakya-web.vercel.app";

const cols = {
  Intelligence: [
    { label: "Latest Briefs", href: "/blogs" },
    { label: "Premium Reports", href: "/subscribe" },
    { label: "Categories", href: "/categories" },
    { label: "Trending", href: "/blogs?trending=true" },
  ],
  Platform: [
    { label: "Subscribe — ₹19/7d", href: "/subscribe" },
    { label: "Sign In", href: "/auth/signin" },
    { label: "Create Account", href: "/auth/signup" },
    { label: "RSS Feed", href: "/feed.xml" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Contact Desk", href: "/contact" },
    { label: "Careers", href: "/careers" },
  ],
  Legal: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.07] bg-[#050505]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2.5 w-fit group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Globe className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Global <span className="text-rose-500">Chanakya</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
              Enterprise-grade geopolitical intelligence for the modern decision-maker. 24-hour premium early access journalism.
            </p>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium w-fit hover:border-emerald-500/40 transition-all"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live on Vercel
              <ExternalLink className="w-3 h-3" />
            </a>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-600">
                <Shield className="w-3.5 h-3.5 text-rose-600/60" />
                256-bit encrypted
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600">
                <Zap className="w-3.5 h-3.5 text-amber-500/60" />
                Razorpay secured
              </span>
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(cols).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mb-10 p-5 rounded-2xl border border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-orange-500/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Get 24-Hour Early Access to Every Report</p>
            <p className="text-xs text-gray-500 mt-0.5">Premium — ₹19 for 7 days. Auto-expires. No commitment.</p>
          </div>
          <Link
            href="/subscribe"
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-sm font-bold rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20"
          >
            <Zap className="w-4 h-4" />
            Subscribe Now
          </Link>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.06]">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Global Chanakya. All rights reserved.</p>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <a href={SITE_URL} target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors flex items-center gap-1">
              global-chanakya-web.vercel.app <ExternalLink className="w-3 h-3" />
            </a>
            <span>·</span>
            <span>Next.js 15 + Turborepo</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
