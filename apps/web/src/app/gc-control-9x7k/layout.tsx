import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin Control Panel | Global Chanakya",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Double-check: only admin can see this layout
  if (!session || session.user.role !== "admin") {
    redirect("/404");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg)] text-white">
      <AdminSidebar user={session.user as any} />
      <main className="flex-1 overflow-y-auto bg-[var(--bg)] relative">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center opacity-[0.02] pointer-events-none" />
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
