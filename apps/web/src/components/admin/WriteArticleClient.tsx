"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  "Geopolitics", "Defence", "Economy", "Diplomacy",
  "Indo-Pacific", "South Asia", "Europe", "Middle East",
  "China", "Russia", "USA", "Energy", "Technology", "Analysis",
];

interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string;
  visibility: "public" | "premium" | "private";
  status: "draft" | "published" | "scheduled";
  isTrending: boolean;
  commentsEnabled: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  featuredImage: string;
}

export default function WriteArticleClient({ authorId }: { authorId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [form, setForm] = useState<FormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Geopolitics",
    tags: "",
    visibility: "public",
    status: "draft",
    isTrending: false,
    commentsEnabled: true,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    featuredImage: "",
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (!editId) {
      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setForm((prev) => ({ ...prev, slug }));
    }
  }, [form.title, editId]);

  // Load blog for editing
  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/blogs?id=${editId}`)
        .then((r) => r.json())
        .then((blog) => {
          if (blog) {
            setForm({
              title: blog.title ?? "",
              slug: blog.slug ?? "",
              excerpt: blog.excerpt ?? "",
              content: blog.content ?? "",
              category: blog.category ?? "Geopolitics",
              tags: (blog.tags ?? []).join(", "),
              visibility: blog.visibility ?? "public",
              status: blog.status ?? "draft",
              isTrending: blog.isTrending ?? false,
              commentsEnabled: blog.commentsEnabled ?? true,
              seoTitle: blog.seo?.title ?? "",
              seoDescription: blog.seo?.description ?? "",
              seoKeywords: (blog.seo?.keywords ?? []).join(", "),
              featuredImage: blog.featuredImage ?? "",
            });
          }
        });
    }
  }, [editId]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S -> Save Draft
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("btn-save-draft")?.click();
      }
      // Ctrl+Enter or Cmd+Enter -> Publish
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        document.getElementById("btn-publish")?.click();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function update(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(publishNow?: boolean) {
    if (!form.title || !form.content || !form.excerpt) {
      alert("Title, excerpt aur content required hai!");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        id: editId ?? undefined,
        authorId,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        seo: {
          title: form.seoTitle || form.title,
          description: form.seoDescription || form.excerpt,
          keywords: form.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        },
        status: publishNow ? "published" : form.status,
      };

      const res = await fetch("/api/admin/blogs", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        if (publishNow) router.push("/gc-control-9x7k/blogs");
      } else {
        const err = await res.json();
        alert(err.error ?? "Kuch galat hua, dobara try karo");
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all";
  const labelClass = "block text-xs text-gray-400 font-medium mb-1.5 uppercase tracking-wider";

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d0d17] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/gc-control-9x7k/blogs")}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            ← Back
          </button>
          <h1 className="text-white font-semibold text-sm">
            {editId ? "✏️ Edit Article" : "✍️ Write New Article"}
          </h1>
          {saved && (
            <span className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full animate-pulse">
              ✓ Saved!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            id="btn-save-draft"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg border border-white/10 transition-all disabled:opacity-50"
          >
            {saving ? "Saving…" : "💾 Save Draft"}
          </button>
          <button
            id="btn-publish"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg transition-all disabled:opacity-50"
          >
            {saving ? "Publishing…" : "🚀 Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1 w-fit">
            {(["content", "seo", "settings"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "bg-amber-500 text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab === "content" ? "📝 Content" : tab === "seo" ? "🔍 SEO" : "⚙️ Settings"}
              </button>
            ))}
          </div>

          {/* Content Tab */}
          {activeTab === "content" && (
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Article Title *</label>
                <input
                  type="text"
                  placeholder="e.g. India-China Border Tensions: A Strategic Analysis"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  className={`${inputClass} text-lg font-medium`}
                />
              </div>

              <div>
                <label className={labelClass}>URL Slug</label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">/blogs/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => update("slug", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Excerpt (Short Summary) *</label>
                <textarea
                  rows={3}
                  placeholder="Article ka short summary jo homepage aur cards pe dikhega…"
                  value={form.excerpt}
                  onChange={(e) => update("excerpt", e.target.value)}
                  className={inputClass}
                />
                <p className="text-gray-600 text-xs mt-1">{form.excerpt.length}/300 characters</p>
              </div>

              <div>
                <label className={labelClass}>Featured Image URL</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={form.featuredImage}
                  onChange={(e) => update("featuredImage", e.target.value)}
                  className={inputClass}
                />
                {form.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.featuredImage} alt="preview" className="mt-2 rounded-lg h-32 object-cover border border-white/10" />
                )}
              </div>

              <div>
                <label className={labelClass}>Article Content (HTML/Text) *</label>
                <textarea
                  rows={20}
                  placeholder="Article ka poora content yahan likhein…&#10;&#10;HTML bhi support hai:&#10;&lt;h2&gt;Section Title&lt;/h2&gt;&#10;&lt;p&gt;Paragraph...&lt;/p&gt;"
                  value={form.content}
                  onChange={(e) => update("content", e.target.value)}
                  className={`${inputClass} font-mono leading-relaxed`}
                />
                <p className="text-gray-600 text-xs mt-1">
                  {form.content.length} characters · ~{Math.ceil(form.content.split(" ").length / 200)} min read
                </p>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-xs font-semibold mb-1">🔍 SEO Tips</p>
                <ul className="text-gray-400 text-xs space-y-1">
                  <li>• SEO title: 50-60 characters ideal</li>
                  <li>• Meta description: 150-160 characters</li>
                  <li>• Focus keyword pehle title mein ho</li>
                </ul>
              </div>

              <div>
                <label className={labelClass}>SEO Title</label>
                <input
                  type="text"
                  placeholder="Title jo Google mein dikhega (blank = article title)"
                  value={form.seoTitle}
                  onChange={(e) => update("seoTitle", e.target.value)}
                  className={inputClass}
                />
                <div className="mt-1 flex justify-between">
                  <p className="text-gray-600 text-xs">{(form.seoTitle || form.title).length}/60</p>
                  <div
                    className={`h-1 rounded-full flex-1 ml-3 mt-1 ${
                      (form.seoTitle || form.title).length <= 60
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                    style={{ maxWidth: `${Math.min(((form.seoTitle || form.title).length / 60) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea
                  rows={3}
                  placeholder="Google search result mein dikhne wala description…"
                  value={form.seoDescription}
                  onChange={(e) => update("seoDescription", e.target.value)}
                  className={inputClass}
                />
                <p className="text-gray-600 text-xs mt-1">{form.seoDescription.length}/160</p>
              </div>

              <div>
                <label className={labelClass}>SEO Keywords (comma separated)</label>
                <input
                  type="text"
                  placeholder="india china, border tensions, geopolitics, defence"
                  value={form.seoKeywords}
                  onChange={(e) => update("seoKeywords", e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Google Preview */}
              <div>
                <label className={labelClass}>Google Preview</label>
                <div className="p-4 bg-white rounded-lg">
                  <p className="text-blue-700 text-sm font-medium truncate">
                    {form.seoTitle || form.title || "Article Title"}
                  </p>
                  <p className="text-green-700 text-xs mt-0.5">
                    global-chanakya-web.vercel.app/blogs/{form.slug || "article-slug"}
                  </p>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                    {form.seoDescription || form.excerpt || "Article description…"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className={inputClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-[#0d0d17]">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Visibility</label>
                  <select
                    value={form.visibility}
                    onChange={(e) => update("visibility", e.target.value as "public" | "premium" | "private")}
                    className={inputClass}
                  >
                    <option value="public" className="bg-[#0d0d17]">🌐 Public (sab dekh sakte)</option>
                    <option value="premium" className="bg-[#0d0d17]">⭐ Premium (subscribers only)</option>
                    <option value="private" className="bg-[#0d0d17]">🔒 Private (sirf admin)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="india, china, border, defence, strategic"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  className={inputClass}
                />
                {form.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                      <span key={tag} className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-xs rounded-full border border-amber-500/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className={labelClass}>Article Options</label>
                {[
                  { key: "isTrending", label: "🔥 Trending Article (homepage pe feature hoga)" },
                  { key: "commentsEnabled", label: "💬 Comments Enable Karein" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => update(key as keyof FormData, !form[key as keyof FormData])}
                      className={`w-10 h-5 rounded-full transition-all relative ${
                        form[key as keyof FormData] ? "bg-amber-500" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${
                          form[key as keyof FormData] ? "translate-x-5" : ""
                        }`}
                      />
                    </div>
                    <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Quick Stats */}
        <div className="w-56 border-l border-white/10 p-4 overflow-y-auto bg-[#0d0d17] hidden lg:block">
          <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-3">Article Info</p>
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-gray-500">Status</p>
              <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full border text-xs capitalize ${
                form.status === "published"
                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                  : "bg-gray-500/20 text-gray-300 border-gray-500/30"
              }`}>
                {form.status}
              </span>
            </div>
            <div>
              <p className="text-gray-500">Word Count</p>
              <p className="text-white font-medium">{form.content.split(/\s+/).filter(Boolean).length}</p>
            </div>
            <div>
              <p className="text-gray-500">Read Time</p>
              <p className="text-white font-medium">~{Math.ceil(form.content.split(/\s+/).filter(Boolean).length / 200)} min</p>
            </div>
            <div>
              <p className="text-gray-500">Excerpt</p>
              <p className="text-white font-medium">{form.excerpt.length}/300</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-2">Shortcuts</p>
            <div className="space-y-1 text-xs text-gray-500">
              <p 
                className="cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSave(false)}
              >
                Draft → <span className="text-white">Ctrl+S</span>
              </p>
              <p 
                className="cursor-pointer hover:text-amber-400 transition-colors"
                onClick={() => handleSave(true)}
              >
                Publish → <span className="text-white">Ctrl+Enter</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
