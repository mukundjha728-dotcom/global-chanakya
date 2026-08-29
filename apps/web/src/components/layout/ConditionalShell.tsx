"use client";
import { usePathname } from "next/navigation";

import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";

export function ConditionalShell({
  navbar,
  footer,
  children,
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/gc-control-9x7k") || pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && navbar}
      {!isAdmin && <PWAInstallPrompt />}
      <div className={isAdmin ? "" : "min-h-screen"}>{children}</div>
      {!isAdmin && footer}
    </>
  );
}
