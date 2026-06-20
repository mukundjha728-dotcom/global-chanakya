"use client";

import { Users, Newspaper, ExternalLink, ShieldAlert, PenTool, LayoutDashboard } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalBlogs: number;
  recentUsers: { _id: string; name: string; email: string; role: string; provider: string; createdAt: string }[];
}

export default function AdminDashboard({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-[var(--blue)]/10 border-[var(--blue)]/20", text: "text-[var(--blue)]" },
    { label: "Total Reports", value: stats.totalBlogs, icon: Newspaper, color: "bg-[var(--gold)]/10 border-[var(--gold)]/20", text: "text-[var(--gold)]" },
  ];

  const roleColors: Record<string, string> = {
    admin: "bg-[var(--gold)]/10 text-[var(--gold)] border-[var(--gold)]/30",
    premium: "bg-[var(--cyan)]/10 text-[var(--cyan)] border-[var(--cyan)]/30",
    free: "bg-[var(--blue)]/10 text-[var(--blue)] border-[var(--blue)]/30",
    guest: "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]",
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto strategic-grid min-h-full">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm intel-border bg-[var(--surface)] text-[var(--gold)] text-[10px] font-bold uppercase tracking-widest mb-3">
            <ShieldAlert className="w-3.5 h-3.5" /> High Clearance Area
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-[-0.02em]">
            Command Center
          </h1>
          <p className="text-[var(--secondary)] mt-2 text-[14px] font-medium border-l-2 border-[var(--gold)] pl-3">
            Welcome back, Director. Here is the latest intelligence brief.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`relative ${card.color} border rounded-sm p-6 overflow-hidden group hover:-translate-y-1 transition-transform duration-300 glass-card`}
          >
            <div className={`absolute top-4 right-4 ${card.text} opacity-30 group-hover:opacity-50 transition-opacity`}>
              <card.icon className="w-8 h-8" />
            </div>
            <p className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-widest">{card.label}</p>
            <p className={`text-4xl font-extrabold mt-2 ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Users + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Users Table */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-sm overflow-hidden glass-card">
          <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]/50">
            <h2 className="text-white font-bold text-[13px] uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-[var(--blue)]" /> Recent Clearances
            </h2>
            <Link href="/admin/users" className="text-[var(--gold)] text-[11px] font-bold uppercase tracking-widest hover:text-[var(--softGold)] transition-colors">
              View all Roster →
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {stats.recentUsers.length === 0 ? (
              <p className="text-[var(--muted)] text-[13px] px-6 py-10 text-center font-medium">No active operatives found</p>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u._id} className="px-6 py-4 flex items-center gap-4 hover:bg-[var(--bg)] transition-colors">
                  <div className="w-10 h-10 rounded-sm bg-[var(--blue)] flex items-center justify-center text-white font-bold text-[14px] shadow-[0_0_10px_rgba(37,99,235,0.3)] border border-blue-400/30">
                    {u.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-[13px] font-bold truncate">{u.name}</p>
                    <p className="text-[var(--muted)] text-[12px] truncate font-medium">{u.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${roleColors[u.role] ?? roleColors.free}`}>
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-sm p-6 glass-card h-fit sticky top-6">
          <h2 className="text-white font-bold text-[13px] uppercase tracking-widest mb-6 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-[var(--gold)]" /> Directives
          </h2>
          <div className="space-y-3">
            {[
              { href: "/admin/write", label: "Write Intel Report", desc: "Draft a new strategic analysis", icon: PenTool },
              { href: "/admin/users", label: "Manage Operatives", desc: "Update user clearances", icon: Users },
              { href: "/admin/blogs", label: "Intelligence Archive", desc: "Edit or classify reports", icon: Newspaper },
              { href: "/", label: "View Public Terminal", desc: "Access the front-facing site", icon: ExternalLink },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-start gap-4 p-4 rounded-sm border border-[var(--border)] hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 transition-all group"
              >
                <div className="mt-0.5 text-[var(--muted)] group-hover:text-[var(--gold)] transition-colors">
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-[13px] font-bold uppercase tracking-wide group-hover:text-[var(--gold)] transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[var(--muted)] text-[12px] mt-1 font-medium">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Admin Lock Notice */}
          <div className="mt-6 p-4 rounded-sm bg-[var(--danger)]/10 border border-[var(--danger)]/30 backdrop-blur-sm">
            <p className="text-[var(--danger)] text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5" /> Protocol Lockdown
            </p>
            <p className="text-[var(--secondary)] text-[12px] mt-2 leading-relaxed">
              System restricted to <span className="text-white font-bold">Director-level access</span>. No unauthorized escalation allowed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
