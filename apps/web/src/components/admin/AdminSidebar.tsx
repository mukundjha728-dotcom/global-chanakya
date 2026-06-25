"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, Users, Newspaper, PenTool, Settings, LogOut, ShieldAlert, LayoutTemplate, Globe, MapPin, Clock, Link as LinkIcon, Search, TrendingUp, FileText, Activity, Image as ImageIcon } from "lucide-react";

export const navItems = [

  // Content
  { href: "/admin/blogs", label: "Blogs", icon: Newspaper, group: "Content" },
  { href: "/admin/categories", label: "Categories", icon: LayoutTemplate, group: "Content" },
  { href: "/admin/tags", label: "Tags", icon: PenTool, group: "Content" },

  // Intelligence
  { href: "/admin/conflicts", label: "Conflicts", icon: ShieldAlert, group: "Intelligence" },
  { href: "/admin/countries", label: "Countries", icon: Globe, group: "Intelligence" },
  { href: "/admin/leaders", label: "Leaders", icon: Users, group: "Intelligence" },
  { href: "/admin/alliances", label: "Alliances", icon: Users, group: "Intelligence" },
  { href: "/admin/regions", label: "Regions", icon: MapPin, group: "Intelligence" },
  { href: "/admin/timelines", label: "Timelines", icon: Clock, group: "Intelligence" },

  // System & SEO
  { href: "/admin/homepage", label: "Homepage", icon: LayoutTemplate, group: "System" },
  { href: "/admin/navigation", label: "Navigation", icon: LinkIcon, group: "System" },
  { href: "/admin/seo", label: "Global SEO", icon: Search, group: "System" },

  // Media & Growth
  { href: "/admin/media", label: "Media Library", icon: ImageIcon, group: "Assets" },
  { href: "/admin/growth", label: "Growth", icon: TrendingUp, group: "Assets" },

  // Admin
  { href: "/admin/users", label: "Users", icon: Users, group: "Admin" },
  { href: "/admin/audit", label: "Audit Logs", icon: FileText, group: "Admin" },
  { href: "/admin/health", label: "Health", icon: Activity, group: "Admin" },
  { href: "/admin/settings", label: "Settings", icon: Settings, group: "Admin" },
];

export default function AdminSidebar({ user }: { user: { name?: string; email?: string; image?: string } }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-w-[256px] h-screen bg-[var(--bg)] border-r border-[var(--border)] flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface)]/50">
        <div className="flex items-center gap-3">
          <Image
            src="/icon.svg"
            alt="GC"
            width={28}
            height={28}
          />
          <div>
            <p className="text-white font-bold text-sm tracking-[-0.02em] leading-tight">Global Chanakya</p>
            <p className="text-[var(--gold)] text-[10px] font-bold uppercase tracking-widest mt-0.5">Admin Desk</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Main Menu</p>
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm text-[13px] font-bold uppercase tracking-wider transition-all ${
                active
                  ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                  : "text-[var(--secondary)] hover:bg-[var(--surface)] hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_5px_var(--gold)]" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-[var(--border)] bg-[var(--surface)]/30">
        <div className="flex items-center gap-3 px-3 py-2 rounded-sm bg-[var(--bg)] border border-[var(--border)] mb-3 shadow-sm">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt="" className="w-8 h-8 rounded-full ring-2 ring-[var(--gold)]/40" />
          ) : (
            <div className="w-8 h-8 rounded-sm bg-[var(--blue)] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(37,99,235,0.3)]">
              {user.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-white text-[12px] font-bold truncate">{user.name}</p>
            <p className="text-[var(--gold)] text-[10px] uppercase tracking-wider truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]/20 border border-transparent transition-all"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
