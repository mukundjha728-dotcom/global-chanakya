import Link from "next/link";
import { ArrowRight, Globe, Lock, ShieldAlert } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-rose-900 selection:text-white font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-8 h-8 text-rose-600" />
            <span className="text-2xl font-bold tracking-tighter uppercase">
              Global <span className="text-rose-600">Chanakya</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <Link href="#latest" className="hover:text-white transition-colors">Latest Intel</Link>
            <Link href="#premium" className="hover:text-white transition-colors flex items-center gap-1">
              <Lock className="w-4 h-4 text-rose-500" /> Premium
            </Link>
            <Link href="/auth/signin" className="px-5 py-2.5 bg-white text-black rounded-full hover:bg-gray-200 transition-colors font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div className="flex flex-col gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-wider w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                Live Geopolitics Desk
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                Deciphering the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-400">
                  Global Chessboard.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-xl">
                Enterprise-grade geopolitical intelligence, strategy, and unvarnished analysis. Get 24-hour early access to critical reports before they hit the mainstream.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link href="#subscribe" className="px-8 py-4 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-all font-semibold flex items-center gap-2 group">
                  Unlock Premium Intel
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="#latest" className="px-8 py-4 border border-white/20 rounded-full hover:bg-white/5 transition-all font-semibold text-gray-300">
                  Read Open Reports
                </Link>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 to-black overflow-hidden group">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-40 transition-opacity duration-700 mix-blend-luminosity"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col gap-4">
                <div className="flex items-center gap-2 text-rose-500 font-mono text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  RESTRICTED - PREMIUM ONLY
                </div>
                <h3 className="text-2xl md:text-3xl font-bold">
                  The Emerging Indo-Pacific Security Architecture
                </h3>
                <p className="text-gray-400 line-clamp-2">
                  An in-depth analysis of strategic realignments in the South China Sea and the broader implications for global supply chains.
                </p>
                <div className="mt-4 flex items-center gap-4">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">24h Early Access</span>
                  <span className="text-sm text-gray-500">Unlocks for public tomorrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
