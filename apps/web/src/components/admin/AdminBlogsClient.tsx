"use client";
import { useState } from "react";
import Link from "next/link";

interface BlogRow {
  _id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  visibility: string;
  isTrending: boolean;
  analytics: { views: number };
  createdAt: string;
  publishAt: string;
}

const statusColors: Record<string, string> = {
  published: "bg-green-500/20 text-green-300 border-green-500/30",
  draft: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  archived: "bg-red-500/20 text-red-300 border-red-500/30",
};

const visibilityColors: Record<string, string> = {
  public: "bg-green-500/10 text-green-400",
  premium: "bg-amber-500/10 text-amber-400",
  private: "bg-gray-500/10 text-gray-400",
};

export default function AdminBlogsClient({ blogs }: { blogs: BlogRow[] }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [localBlogs, setLocalBlogs] = useState(blogs);

  const filtered = localBlogs.filter((b) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  async function deleteBlog(id: string, slug: string) {
    if (!confirm(`"${slug}" delete karna chahte hain?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/blogs?id=${id}`, { method: "DELETE" });
      if (res.ok) setLocalBlogs((prev) => prev.filter((b) => b._id !== id));
    } finally {
      setDeleting(null);
    }
  }

  async function toggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const res = await fetch("/api/admin/blogs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (res.ok) {
      setLocalBlogs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blogs Management 📰</h1>
          <p className="text-gray-400 text-sm mt-1">{localBlogs.length} total articles</p>
        </div>
        <Link
          href="/admin/write"
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-all"
        >
          ✍️ Write New Article
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Search articles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
        />
        {["all", "published", "draft", "scheduled", "archived"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
              filterStatus === s
                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                : "bg-white/5 text-gray-400 border-white/10 hover:text-white"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#0d0d17] border border-white/10 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-400 text-sm">Koi article nahi mila</p>
            <Link
              href="/admin/write"
              className="inline-block mt-4 px-4 py-2 bg-amber-500 text-black font-semibold rounded-lg text-sm hover:bg-amber-400 transition-all"
            >
              Pehla Article Likho ✍️
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Title", "Category", "Status", "Visibility", "Views", "Date", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-4 py-3 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-white/3 transition-colors group">
                    <td className="px-4 py-3 max-w-[220px]">
                      <div className="flex items-center gap-2">
                        {b.isTrending && <span className="text-amber-400 text-xs">🔥</span>}
                        <p className="text-white text-xs font-medium truncate">{b.title}</p>
                      </div>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">/blogs/{b.slug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300 text-xs bg-white/5 px-2 py-0.5 rounded capitalize">
                        {b.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs border capitalize ${statusColors[b.status] ?? statusColors.draft}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium capitalize ${visibilityColors[b.visibility] ?? ""}`}>
                        {b.visibility === "premium" ? "⭐ Open Intel" : b.visibility === "private" ? "🔒 Private" : "🌐 Public"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">
                      👁 {(b.analytics?.views ?? 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleStatus(b._id, b.status)}
                          className="px-2 py-1 rounded text-xs border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all"
                          title={b.status === "published" ? "Draft pe bhejo" : "Publish karo"}
                        >
                          {b.status === "published" ? "↓ Draft" : "↑ Publish"}
                        </button>
                        <Link
                          href={`/admin/write?edit=${b._id}`}
                          className="px-2 py-1 rounded text-xs border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteBlog(b._id, b.slug)}
                          disabled={deleting === b._id}
                          className="px-2 py-1 rounded text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                          {deleting === b._id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
