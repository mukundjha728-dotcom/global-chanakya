"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Zap, Lock, UserPlus } from "lucide-react";
import { usePathname } from "next/navigation";

interface PremiumLockProps {
  children: ReactNode;
  earlyAccessUntil?: Date | string | null;
  userRole?: string | null;
  isLoggedIn?: boolean;
  blogSlug?: string;
}

export default function PremiumLock({
  children,
  earlyAccessUntil,
  userRole,
  isLoggedIn,
  blogSlug,
}: PremiumLockProps) {
  // PUBLIC articles — no lock at all
  if (!earlyAccessUntil) return <>{children}</>;

  const lockExpiry = new Date(earlyAccessUntil);
  const isStillLocked = lockExpiry > new Date();
  const canAccess = userRole === "premium" || userRole === "admin";

  // Lock has expired → everyone can read
  if (!isStillLocked) return <>{children}</>;

  // Has premium/admin access → full access
  if (canAccess) return <>{children}</>;

  // ── LOCKED UI ──
  const currentPath = blogSlug ? `/blogs/${blogSlug}` : "";
  const signupUrl = `/auth/signup?next=${encodeURIComponent(currentPath)}`;
  const signinUrl = `/auth/signin?callbackUrl=${encodeURIComponent("/subscribe")}`;
  const subscribeUrl = `/subscribe`;

  const hoursLeft = Math.max(
    0,
    Math.ceil((lockExpiry.getTime() - Date.now()) / (1000 * 60 * 60))
  );

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="opacity-20 blur-sm select-none pointer-events-none overflow-hidden max-h-[320px]">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="mt-6 p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center">
        <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-6 h-6 text-amber-400" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Zap className="w-3 h-3" /> Premium Early Access
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
          This report is locked for {hoursLeft}h more
        </h3>
        <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
          Premium subscribers read this article{" "}
          <strong className="text-white">24 hours before</strong> it goes public.
          Unlock it now for just <strong className="text-amber-400">₹19</strong>.
        </p>

        {!isLoggedIn ? (
          // NOT logged in → sign up first
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={signupUrl}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Create Free Account
            </Link>
            <Link
              href={signinUrl}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/15 text-gray-300 font-medium rounded-full hover:bg-white/5 transition-all text-sm"
            >
              Already have account? Sign in
            </Link>
          </div>
        ) : (
          // Logged in but not premium → subscribe
          <Link
            href={subscribeUrl}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-bold rounded-full hover:opacity-90 transition-all shadow-lg shadow-amber-500/20"
          >
            <Zap className="w-4 h-4" />
            Get Premium Access — ₹19 / 7 Days
          </Link>
        )}

        <p className="text-gray-600 text-xs mt-5">
          Unlocks publicly on {lockExpiry.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}
