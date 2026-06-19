"use client";
import { useState } from "react";

interface UserRow {
  _id: string;
  name: string;
  email: string;
  role: string;
  provider: string;
  isBanned: boolean;
  createdAt: string;
}

const roleColors: Record<string, string> = {
  admin: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  premium: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  free: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  guest: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

const providerIcons: Record<string, string> = {
  google: "🌐",
  github: "🐙",
  credentials: "🔑",
};

export default function UsersTable({ users }: { users: UserRow[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState<string | null>(null);
  const [localUsers, setLocalUsers] = useState(users);

  const filtered = localUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "banned" ? u.isBanned : u.role === filter);
    return matchSearch && matchFilter;
  });

  async function updateRole(userId: string, newRole: string) {
    setLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "setRole", role: newRole }),
      });
      if (res.ok) {
        setLocalUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
        );
      }
    } finally {
      setLoading(null);
    }
  }

  async function toggleBan(userId: string, currentBan: boolean) {
    setLoading(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: currentBan ? "unban" : "ban" }),
      });
      if (res.ok) {
        setLocalUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isBanned: !currentBan } : u))
        );
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users Management 👥</h1>
        <p className="text-gray-400 text-sm mt-1">
          {localUsers.length} total users · Admin account is locked (cannot change)
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
        />
        {["all", "admin", "free", "banned"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
              filter === f
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0d0d17] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">User</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Provider</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Role</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Status</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Joined</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-12">No users found</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id} className={`hover:bg-white/3 transition-colors ${u.isBanned ? "opacity-50" : ""}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-300 text-xs font-bold border border-amber-500/20">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-xs">{u.name}</p>
                          <p className="text-gray-500 text-xs">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {providerIcons[u.provider] ?? "?"} {u.provider}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${roleColors[u.role] ?? roleColors.free}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${u.isBanned ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-green-500/20 text-green-300 border-green-500/30"}`}>
                        {u.isBanned ? "Banned" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-5 py-3">
                      {u.role === "admin" ? (
                        <span className="text-xs text-gray-600 italic">Protected</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            disabled={loading === u._id}
                            value={u.role}
                            onChange={(e) => updateRole(u._id, e.target.value)}
                            className="text-xs bg-white/5 border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-amber-500/50 disabled:opacity-50"
                          >
                            <option value="free">Free</option>

                          </select>
                          <button
                            disabled={loading === u._id}
                            onClick={() => toggleBan(u._id, u.isBanned)}
                            className={`text-xs px-2 py-1 rounded border transition-all disabled:opacity-50 ${
                              u.isBanned
                                ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                            }`}
                          >
                            {loading === u._id ? "…" : u.isBanned ? "Unban" : "Ban"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
