"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Lock, User, LogOut, Menu, X, ChevronDown, Zap } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface NavbarClientProps {
  session: {
    user?: {
      name?: string | null;
      email?: string | null;
      role?: string;
    };
  } | null;
}

const navLinks = [
  { label: "Latest Intel", href: "/blogs" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
];

export default function NavbarClient({ session }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isPremium = (session?.user as any)?.role === "premium";
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <nav className="fixed w-full z-50 top-0">
      {/* Glassmorphism bar */}
      <div className="border-b border-white/[0.07] bg-black/60 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[68px] flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:shadow-rose-500/40 transition-shadow">
              <Globe className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
            </div>
            <span className="text-[17px] font-bold tracking-tight text-white">
              Global <span className="text-rose-500">Chanakya</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  pathname === link.href
                    ? "text-white bg-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/subscribe"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              Premium ₹19
            </Link>
          </div>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full hover:bg-purple-500/20 transition-all"
                  >
                    Admin Panel
                  </Link>
                )}
                <div className="flex items-center gap-2 bg-white/[0.06] border border-white/10 px-3 py-1.5 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-[10px] font-bold text-white">
                    {(session.user?.name || "U")[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-white font-medium max-w-[100px] truncate">
                    {session.user?.name || "Agent"}
                  </span>
                  {isPremium && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-400 rounded border border-amber-500/30 uppercase tracking-wide">
                      PRO
                    </span>
                  )}
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold bg-purple-500/20 text-purple-400 rounded border border-purple-500/30 uppercase tracking-wide">
                      ADMIN
                    </span>
                  )}
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition-all shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/10 bg-black/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/subscribe"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all"
            >
              <Zap className="w-4 h-4" />
              Premium — ₹19/7 Days
            </Link>
            <div className="pt-3 border-t border-white/10">
              {session ? (
                <button
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 transition-all"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-xl bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-all"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
