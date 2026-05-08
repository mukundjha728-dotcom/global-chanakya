"use client";
import { usePathname } from "next/navigation";

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
  const isAdmin = pathname.startsWith("/gc-control-9x7k");

  return (
    <>
      {!isAdmin && navbar}
      <div className={isAdmin ? "" : "min-h-screen"}>{children}</div>
      {!isAdmin && footer}
    </>
  );
}
