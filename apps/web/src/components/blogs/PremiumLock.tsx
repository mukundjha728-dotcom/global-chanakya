import { ReactNode } from "react";
import { isAfter } from "date-fns";
import Link from "next/link";

interface PremiumLockProps {
  children: ReactNode;
  earlyAccessUntil?: Date;
  userRole?: string;
}

export default function PremiumLock({ children, earlyAccessUntil, userRole }: PremiumLockProps) {
  // If no lock date, it's public
  if (!earlyAccessUntil) return <>{children}</>;

  const isLocked = isAfter(new Date(earlyAccessUntil), new Date());
  const canAccess = userRole === "premium" || userRole === "admin";

  if (isLocked && !canAccess) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-background/50 flex flex-col items-center justify-center p-6 text-center border rounded-xl">
          <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full mb-4">Premium Early Access</span>
          <h3 className="text-2xl font-bold mb-2">24-Hour Early Access</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            This article is currently available exclusively to premium subscribers. It will become public on {new Date(earlyAccessUntil).toLocaleString()}.
          </p>
          <Link href="/subscribe" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 shadow-md transition">
            Subscribe for ₹19 / 7 Days
          </Link>
        </div>
        {/* Blurred Content Preview */}
        <div className="opacity-30 blur-sm select-none pointer-events-none overflow-hidden h-[400px]">
          {children}
        </div>
      </div>
    );
  }

  // User has access or lock expired
  return <>{children}</>;
}
