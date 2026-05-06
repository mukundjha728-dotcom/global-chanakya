import { ReactNode } from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Users, BarChart3,
  ShieldAlert, Image, Settings, Globe, LogOut, Zap
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Blogs", href: "/admin/blogs", icon: FileText },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Security", href: "/admin/security", icon: ShieldAlert },
  { label: "Media Library", href: "/admin/media", icon: Image },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // In development, allow access without strict role check for easier testing.
  const isDev = process.env.NODE_ENV === "development";
  const session = await auth();

  if (!isDev) {
    // Production: strict admin-only
    if (!session || (session.user as any)?.role !== "admin") {
      redirect("/");
    }
  } else {
    // Development: at minimum require login
    if (!session) {
      redirect("/auth/signin");
    }
  }

  const userName = session?.user?.name ?? "Admin";
  const userEmail = session?.user?.email ?? "";
  const userRole = (session?.user as any)?.role ?? "dev";

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-white/[0.07] bg-[#080808]">
        {/* Logo */}
        <div className="h-[68px] flex items-center px-5 border-b border-white/[0.07]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
              <Globe className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">
              Global <span className="text-rose-500">Chanakya</span>
            </span>
          </Link>
        </div>

        {/* Admin badge */}
        <div className="px-5 py-3 border-b border-white/[0.05]">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>

        {/* Dev banner */}
        {isDev && userRole !== "admin" && (
          <div className="px-5 py-2 border-b border-amber-500/10 bg-amber-500/5">
            <p className="text-[10px] text-amber-400">⚡ Dev Mode — Auth bypassed</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all group"
            >
              <Icon className="w-4 h-4 shrink-0 group-hover:text-rose-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User info */}
        <div className="px-5 py-4 border-t border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-500 to-orange-400 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {userName[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{userName}</p>
              <p className="text-[10px] text-gray-600 truncate">{userEmail}</p>
            </div>
            <Link href="/api/auth/signout" className="p-1.5 text-gray-600 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-[68px] border-b border-white/[0.07] flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-sm font-semibold text-white">Admin Dashboard</h1>
            <a href="https://global-chanakya-web.vercel.app" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              global-chanakya-web.vercel.app ↗
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://global-chanakya-web.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-medium hover:border-emerald-500/40 transition-all"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live
            </a>
            <Link
              href="/admin/blogs/new"
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-full hover:bg-rose-700 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              New Blog
            </Link>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
