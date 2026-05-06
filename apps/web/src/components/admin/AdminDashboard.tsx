"use client";

interface Stats {
  totalUsers: number;
  totalBlogs: number;
  premiumUsers: number;
  freeUsers: number;
  recentUsers: { _id: string; name: string; email: string; role: string; provider: string; createdAt: string }[];
}

export default function AdminDashboard({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: "👥", color: "from-blue-500/20 to-blue-600/10 border-blue-500/30", text: "text-blue-300" },
    { label: "Total Articles", value: stats.totalBlogs, icon: "📰", color: "from-purple-500/20 to-purple-600/10 border-purple-500/30", text: "text-purple-300" },
    { label: "Premium Members", value: stats.premiumUsers, icon: "⭐", color: "from-amber-500/20 to-amber-600/10 border-amber-500/30", text: "text-amber-300" },
    { label: "Free Members", value: stats.freeUsers, icon: "🆓", color: "from-green-500/20 to-green-600/10 border-green-500/30", text: "text-green-300" },
  ];

  const roleColors: Record<string, string> = {
    admin: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    premium: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    free: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    guest: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Command Center <span className="text-amber-400">⚡</span>
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Welcome back, Admin. Here's what's happening with Global Chanakya.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`relative bg-gradient-to-br ${card.color} border rounded-xl p-5 overflow-hidden group hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className="absolute top-3 right-4 text-3xl opacity-20 group-hover:opacity-30 transition-opacity">
              {card.icon}
            </div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{card.label}</p>
            <p className={`text-3xl font-bold mt-1 ${card.text}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Users + Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users Table */}
        <div className="lg:col-span-2 bg-[#0d0d17] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Recent Signups</h2>
            <a href="/gc-control-9x7k/users" className="text-amber-400 text-xs hover:text-amber-300 transition-colors">
              View all →
            </a>
          </div>
          <div className="divide-y divide-white/5">
            {stats.recentUsers.length === 0 ? (
              <p className="text-gray-500 text-sm px-5 py-8 text-center">No users yet</p>
            ) : (
              stats.recentUsers.map((u) => (
                <div key={u._id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/20 flex items-center justify-center text-amber-300 font-semibold text-xs border border-amber-500/20">
                    {u.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{u.name}</p>
                    <p className="text-gray-500 text-xs truncate">{u.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs border ${roleColors[u.role] ?? roleColors.free}`}>
                    {u.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#0d0d17] border border-white/10 rounded-xl p-5">
          <h2 className="text-white font-semibold text-sm mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: "/gc-control-9x7k/write", label: "✍️ Write New Article", desc: "Create & publish content" },
              { href: "/gc-control-9x7k/users", label: "👥 Manage Users", desc: "View, ban, upgrade users" },
              { href: "/gc-control-9x7k/blogs", label: "📰 Manage Blogs", desc: "Edit, delete articles" },
              { href: "/", label: "🌐 View Live Site", desc: "Open public-facing site" },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-start gap-3 p-3 rounded-lg border border-white/5 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all group"
              >
                <div className="flex-1">
                  <p className="text-white text-xs font-medium group-hover:text-amber-300 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{action.desc}</p>
                </div>
                <span className="text-gray-600 group-hover:text-amber-400 transition-colors text-xs mt-0.5">→</span>
              </a>
            ))}
          </div>

          {/* Admin Lock Notice */}
          <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-300 text-xs font-semibold">🔒 Admin Locked</p>
            <p className="text-gray-400 text-xs mt-1">
              Only 1 admin account allowed. New signups cannot receive admin role.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
