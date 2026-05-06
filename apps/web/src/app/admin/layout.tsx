import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session || (session.user as any)?.role !== 'admin') {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-64 border-r p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-6">Global Chanakya Admin</h2>
        <nav className="flex flex-col gap-2">
          <a href="/admin" className="p-2 hover:bg-muted rounded-md font-medium">Dashboard</a>
          <a href="/admin/blogs" className="p-2 hover:bg-muted rounded-md font-medium">Blogs</a>
          <a href="/admin/users" className="p-2 hover:bg-muted rounded-md font-medium">Users</a>
          <a href="/admin/settings" className="p-2 hover:bg-muted rounded-md font-medium">Settings</a>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
