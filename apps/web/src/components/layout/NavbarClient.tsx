"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Lock, User, LogOut, Menu, X, Crown, ChevronRight, Bookmark, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";

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
  { label: "Reports", href: "/blogs" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
];

export default function NavbarClient({ session }: NavbarClientProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    if (!profileOpen) return;
    const close = () => setProfileOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [profileOpen]);

  return (
    <nav className="fixed w-full z-50 top-0">
      <div
        className="transition-all duration-300"
        style={{
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          background: scrolled ? "rgba(6,6,6,0.85)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <Image
              src="/brand/logo.svg"
              alt="Global Chanakya"
              width={34}
              height={34}
              className="group-hover:scale-105 transition-transform duration-200"
            />
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-[-0.02em] text-white leading-tight">
                Global Chanakya
              </span>
              <span className="text-[10px] font-medium text-neutral-500 tracking-[0.06em] uppercase leading-tight">
                Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors duration-200 ${
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                    ? "text-white bg-white/[0.08]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            ))}

          </div>

          {/* Right */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="relative flex items-center gap-2">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-violet-400 bg-violet-500/[0.08] border border-violet-500/20 rounded-lg hover:bg-violet-500/15 transition-colors"
                  >
                    <LayoutDashboard className="w-3 h-3" />
                    Dashboard
                  </Link>
                )}

                {/* Profile button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-[11px] font-bold text-white">
                    {(session.user?.name || "U")[0].toUpperCase()}
                  </div>
                  <span className="text-[13px] text-neutral-300 font-medium max-w-[90px] truncate">
                    {session.user?.name?.split(" ")[0] || "User"}
                  </span>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider bg-violet-500/15 text-violet-400 border border-violet-500/25">
                      Admin
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 py-2 rounded-xl bg-[#111111] border border-white/[0.08] shadow-2xl shadow-black/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-4 py-2 border-b border-white/[0.06]">
                      <p className="text-[13px] font-medium text-white truncate">{session.user?.name}</p>
                      <p className="text-[11px] text-neutral-500 truncate">{session.user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-2 px-4 py-2 text-[13px] text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-[13px] font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 bg-white text-[#060606] text-[13px] font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/[0.06] bg-[#060606]/98 backdrop-blur-xl">
          <div className="px-5 py-5 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                  pathname === link.href
                    ? "text-white bg-white/[0.06]"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-[14px] font-medium text-violet-400 hover:bg-violet-500/[0.06] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}

            <div className="pt-4 border-t border-white/[0.06]">
              {session ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                      {(session.user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-white">{session.user?.name}</p>
                      <p className="text-[11px] text-neutral-500">{session.user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-[14px] text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-xl border border-white/[0.08] text-[14px] font-medium text-neutral-300 hover:bg-white/[0.04] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full px-4 py-3 text-center rounded-xl bg-white text-[#060606] text-[14px] font-semibold hover:bg-neutral-100 transition-colors"
                  >
                    Create Account
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
