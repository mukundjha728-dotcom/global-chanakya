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
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/404");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <AdminSidebar user={session.user as any} />
      <main className="flex-1 overflow-y-auto bg-[#0a0a0f]">
        {children}
      </main>
    </div>
  );
}
