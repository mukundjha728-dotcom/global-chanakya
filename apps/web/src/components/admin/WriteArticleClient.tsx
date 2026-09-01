"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ─── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Geopolitics", "Defence", "Economy", "Diplomacy",
  "Indo-Pacific", "South Asia", "Europe", "Middle East",
  "China", "Russia", "USA", "Energy", "Technology", "Analysis",
];

const REPORT_TYPES = ["Analysis", "Briefing", "Op-Ed", "Intelligence", "Report"];

const VISIBILITY_OPTIONS = [
  { value: "public", label: "🌐 Public" },
  { value: "premium", label: "⭐ Premium (subscribers only)" },
  { value: "private", label: "🔒 Private (admin only)" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "📝 Draft" },
  { value: "published", label: "✅ Published" },
  { value: "archived", label: "📦 Archived" },
  { value: "scheduled", label: "📅 Scheduled" },
];

const ROBOTS_OPTIONS = [
  { value: "index,follow", label: "index, follow (default)" },
  { value: "noindex,follow", label: "noindex, follow" },
  { value: "index,nofollow", label: "index, nofollow" },
  { value: "noindex,nofollow", label: "noindex, nofollow" },
];

// ─── Form Data Interface ──────────────────────────────────────────────────────
interface FormData {
  // Core
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  // SEO
  focusKeyword: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalUrl: string;
  robots: string;
  ogImage: string;
  aiSummary: string;
  // Settings
  category: string;
  reportType: string;
  visibility: "public" | "premium" | "private";
  status: "draft" | "published" | "archived" | "scheduled";
  tags: string;
  isTrending: boolean;
  commentsEnabled: boolean;
  isBreaking: boolean;
  breakingUntil: string;
  isFeatured: boolean;
  featuredUntil: string;
  publishAt: string;
  unpublishAt: string;
  // Linked entities (stored as comma-separated IDs in the form, arrays in payload)
  countries: string;
  leaders: string;
  conflicts: string;
  organizations: string;
  // References (one per line)
  references: string;
}

// ─── Entity cache for linked entity selectors ─────────────────────────────────
interface EntityOption {
  _id: string;
  name: string;
}

// ─── Helper: format datetime-local value ──────────────────────────────────────
function toDatetimeLocal(val: string | Date | undefined | null): string {
  if (!val) return "";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function WriteArticleClient({ authorId }: { authorId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  // ─── State ────────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState(0); // 0=idle,1=saving,2=indexing,3=done
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [editorMode, setEditorMode] = useState<"code" | "preview">("code");
  const slugManuallyEdited = useRef(false);

  // Entity caches
  const [entityCountries, setEntityCountries] = useState<EntityOption[]>([]);
  const [entityLeaders, setEntityLeaders] = useState<EntityOption[]>([]);
  const [entityConflicts, setEntityConflicts] = useState<EntityOption[]>([]);
  const [entityOrgs, setEntityOrgs] = useState<EntityOption[]>([]);

  const [form, setForm] = useState<FormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    featuredImage: "",
    // SEO
    focusKeyword: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    robots: "index,follow",
    ogImage: "",
    aiSummary: "",
    // Settings
    category: "Geopolitics",
    reportType: "",
    visibility: "public",
    status: "draft",
    tags: "",
    isTrending: false,
    commentsEnabled: true,
    isBreaking: false,
    breakingUntil: "",
    isFeatured: false,
    featuredUntil: "",
    publishAt: "",
    unpublishAt: "",
    countries: "",
    leaders: "",
    conflicts: "",
    organizations: "",
    references: "",
  });

  // ─── Auto-slug from title ─────────────────────────────────────────────────
  useEffect(() => {
    if (!slugManuallyEdited.current) {
      const slug = form.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setForm((prev) => ({ ...prev, slug }));
    }
  }, [form.title]);

  // ─── Fetch entity lists for selectors ─────────────────────────────────────
  useEffect(() => {
    async function fetchEntities() {
      try {
        const [countriesRes, leadersRes, conflictsRes] = await Promise.allSettled([
          fetch("/api/admin/intelligence/countries").then(r => r.ok ? r.json() : []),
          fetch("/api/admin/intelligence/leaders").then(r => r.ok ? r.json() : []),
          fetch("/api/admin/intelligence/conflicts").then(r => r.ok ? r.json() : []),
        ]);
        if (countriesRes.status === "fulfilled") setEntityCountries(countriesRes.value);
        if (leadersRes.status === "fulfilled") setEntityLeaders(leadersRes.value);
        if (conflictsRes.status === "fulfilled") setEntityConflicts(conflictsRes.value);
      } catch { /* silent — entities are optional */ }
    }
    fetchEntities();
  }, []);

  // ─── Load existing article for editing ────────────────────────────────────
  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/blogs?id=${editId}`)
        .then((r) => r.json())
        .then((blog) => {
          if (blog) {
            slugManuallyEdited.current = true; // Don't overwrite loaded slug
            setForm({
              title: blog.title ?? "",
              slug: blog.slug ?? "",
              excerpt: blog.excerpt ?? "",
              content: blog.content ?? "",
              featuredImage: blog.featuredImage ?? "",
              // SEO
              focusKeyword: blog.seo?.focusKeyword ?? "",
              seoTitle: blog.seo?.title ?? "",
              seoDescription: blog.seo?.description ?? "",
              seoKeywords: (blog.seo?.keywords ?? []).join(", "),
              canonicalUrl: blog.seo?.canonicalUrl ?? "",
              robots: blog.seo?.robots ?? "index,follow",
              ogImage: blog.ogImage ?? "",
              aiSummary: blog.aiSummary ?? "",
              // Settings
              category: blog.category ?? "Geopolitics",
              reportType: blog.reportType ?? "",
              visibility: blog.visibility ?? "public",
              status: blog.status ?? "draft",
              tags: (blog.tags ?? []).join(", "),
              isTrending: blog.isTrending ?? false,
              commentsEnabled: blog.commentsEnabled ?? true,
              isBreaking: blog.isBreaking ?? false,
              breakingUntil: toDatetimeLocal(blog.breakingUntil),
              isFeatured: blog.isFeatured ?? false,
              featuredUntil: toDatetimeLocal(blog.featuredUntil),
              publishAt: toDatetimeLocal(blog.publishAt),
              unpublishAt: toDatetimeLocal(blog.unpublishAt),
              // Entity relations — stored as ObjectId strings
              countries: (blog.countries ?? []).map((e: any) => typeof e === "object" ? e._id || e : e).join(", "),
              leaders: (blog.leaders ?? []).map((e: any) => typeof e === "object" ? e._id || e : e).join(", "),
              conflicts: (blog.conflicts ?? []).map((e: any) => typeof e === "object" ? e._id || e : e).join(", "),
              organizations: (blog.organizations ?? []).map((e: any) => typeof e === "object" ? e._id || e : e).join(", "),
              // References from citations
              references: (blog.citations ?? []).map((c: any) => c.url || c.source || "").filter(Boolean).join("\n"),
            });
          }
        });
    }
  }, [editId]);

  // ─── Keyboard Shortcuts ───────────────────────────────────────────────────
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

  // ─── Field update helper ──────────────────────────────────────────────────
  function update(field: keyof FormData, value: string | boolean) {
    if (field === "slug") slugManuallyEdited.current = true;
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // ─── Build API payload ────────────────────────────────────────────────────
  function buildPayload(publishNow: boolean) {
    const refsArray = form.references
      .split("\n")
      .map(r => r.trim())
      .filter(Boolean)
      .map(url => ({ type: "Primary" as const, source: url, url }));

    return {
      id: editId ?? undefined,
      authorId,
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      content: form.content,
      category: form.category,
      featuredImage: form.featuredImage || "",
      ogImage: form.ogImage || "",
      aiSummary: form.aiSummary || "",
      reportType: form.reportType || undefined,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      visibility: form.visibility,
      status: publishNow ? "published" : form.status,
      isTrending: form.isTrending,
      commentsEnabled: form.commentsEnabled,
      isBreaking: form.isBreaking,
      breakingUntil: form.breakingUntil || undefined,
      isFeatured: form.isFeatured,
      featuredUntil: form.featuredUntil || undefined,
      publishAt: form.publishAt || undefined,
      unpublishAt: form.unpublishAt || undefined,
      countries: form.countries.split(",").map(s => s.trim()).filter(Boolean),
      leaders: form.leaders.split(",").map(s => s.trim()).filter(Boolean),
      conflicts: form.conflicts.split(",").map(s => s.trim()).filter(Boolean),
      organizations: form.organizations.split(",").map(s => s.trim()).filter(Boolean),
      citations: refsArray,
      seo: {
        focusKeyword: form.focusKeyword || "",
        title: form.seoTitle || form.title,
        description: form.seoDescription || form.excerpt,
        keywords: form.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        canonicalUrl: form.canonicalUrl || "",
        robots: form.robots || "index,follow",
      },
    };
  }

  // ─── Save / Publish ───────────────────────────────────────────────────────
  async function handleSave(publishNow?: boolean) {
    if (!form.title || !form.content || !form.excerpt) {
      alert("Title, excerpt aur content required hai!");
      return;
    }

    if (publishNow) {
      setPublishing(true);
      setPublishStep(1);
    } else {
      setSaving(true);
    }

    // AbortController — 45 second hard timeout
    const controller = new AbortController();
    const hardTimeout = setTimeout(() => controller.abort(), 45000);

    try {
      const payload = buildPayload(!!publishNow);

      // Move to step 2 after 1.5s (visual feedback)
      let stepTimer: ReturnType<typeof setTimeout> | null = null;
      if (publishNow) {
        stepTimer = setTimeout(() => setPublishStep(2), 1500);
      }

      let res: Response;
      try {
        res = await fetch("/api/admin/blogs", {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } catch (fetchErr: any) {
        if (stepTimer) clearTimeout(stepTimer);
        const msg = fetchErr?.name === "AbortError"
          ? "Request timed out (45s). MongoDB slow hai. Dobara try karo."
          : "Network error. Internet check karo aur dobara try karo.";
        if (publishNow) { setPublishing(false); setPublishStep(0); }
        else setSaving(false);
        alert(msg);
        return;
      }

      if (stepTimer) clearTimeout(stepTimer);

      if (res.ok) {
        if (publishNow) {
          setPublishStep(3);
          setTimeout(() => {
            setPublishing(false);
            setPublishStep(0);
            router.push("/gc-control-9x7k/blogs");
          }, 1500);
        } else {
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        }
      } else {
        let errMsg = `Server Error (${res.status})`;
        try {
          const errBody = await res.json();
          errMsg = errBody.error ?? errMsg;
        } catch {
          // Response body wasn't JSON - show status text
          errMsg = `Server Error ${res.status}: ${res.statusText || "Unknown error"}`;
        }
        if (publishNow) { setPublishing(false); setPublishStep(0); }
        alert(`❌ Error: ${errMsg}`);
      }
    } finally {
      clearTimeout(hardTimeout);
      if (!publishNow) setSaving(false);
    }
  }

  // ─── Style constants (preserved from historical editor) ───────────────────
  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all";
  const labelClass = "block text-xs text-gray-400 font-medium mb-1.5 uppercase tracking-wider";
  const selectBgClass = "bg-[#0d0d17]";

  // ─── Word count helpers ───────────────────────────────────────────────────
  const plainText = form.content.replace(/<[^>]*>/g, " ");
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full relative">
      {/* ═══════ Publishing Progress Overlay ═══════ */}
      {publishing && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#0d0d17] border border-white/10 rounded-3xl p-10 max-w-sm w-full mx-6 text-center shadow-2xl">
            <div className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl transition-all ${publishStep === 3 ? "bg-green-500/20 border border-green-500/30" : "bg-amber-500/20 border border-amber-500/30"}`}>
              {publishStep === 1 && "💾"}
              {publishStep === 2 && (
                <span className="animate-spin inline-block">🔄</span>
              )}
              {publishStep === 3 && "🎉"}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {publishStep === 1 && "Saving Article..."}
              {publishStep === 2 && "Making it Live..."}
              {publishStep === 3 && "Published!"}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {publishStep === 1 && "Uploading your article to the database"}
              {publishStep === 2 && "Connecting to database and publishing..."}
              {publishStep === 3 && "Your article is now live for everyone to read!"}
            </p>
            <div className="flex gap-2 items-center justify-center mb-6">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    publishStep >= step
                      ? step === 3
                        ? "w-8 bg-green-500"
                        : "w-8 bg-amber-500"
                      : "w-4 bg-white/10"
                  }`}
                />
              ))}
            </div>
            {publishStep < 3 && (
              <button
                onClick={() => { setPublishing(false); setPublishStep(0); }}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors underline"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ═══════ Top Bar ═══════ */}
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
        {/* ═══════ Main Editor (Vertical Cards) ═══════ */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* ═══════════════════════════════════════════════════════════════════
              CARD 1 — ARTICLE IDENTITY
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-[#0d0d17] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
              <h2 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--gold)]"></span>
                Article Identity
              </h2>
            </div>
            <div className="p-6 space-y-5">
              {/* Title */}
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

              {/* Slug */}
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

              {/* Excerpt */}
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

              {/* Featured Image */}
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
                  <img src={form.featuredImage} alt="preview" className="mt-3 rounded-xl h-40 w-auto object-cover border border-white/10 shadow-lg" />
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              CARD 2 — ARTICLE CONTENT
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-[#0d0d17] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h2 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--cyan)]"></span>
                Article Content
              </h2>
              <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setEditorMode("code")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                    editorMode === "code" ? "bg-[var(--cyan)] text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  &lt;/&gt; Code
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("preview")}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                    editorMode === "preview" ? "bg-[var(--cyan)] text-black" : "text-gray-400 hover:text-white"
                  }`}
                >
                  👁 Preview
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {editorMode === "code" ? (
                <>
                  <textarea
                    rows={28}
                    spellCheck={false}
                    placeholder={`Write full HTML with embedded CSS & JS:\n\n<style>\n  h2 { color: #f59e0b; }\n</style>\n\n<h2>Section Title</h2>\n<p>Your paragraph here...</p>\n\n<script>\n  console.log('Hello!');\n<\/script>`}
                    value={form.content}
                    onChange={(e) => update("content", e.target.value)}
                    className={`${inputClass} font-mono text-sm leading-relaxed resize-y bg-[#0a0a12]`}
                    style={{ minHeight: "520px", tabSize: 2 }}
                    onKeyDown={(e) => {
                      if (e.key === "Tab") {
                        e.preventDefault();
                        const start = e.currentTarget.selectionStart;
                        const end = e.currentTarget.selectionEnd;
                        const val = e.currentTarget.value;
                        const newVal = val.substring(0, start) + "  " + val.substring(end);
                        update("content", newVal);
                        requestAnimationFrame(() => {
                          e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                        });
                      }
                    }}
                  />
                  <div className="flex items-center gap-4 mt-2 px-1">
                    <p className="text-gray-500 text-xs font-medium">
                      <span className="text-white">{form.content.length.toLocaleString()}</span> chars · <span className="text-white">~{readTime} min</span> read
                    </p>
                    <p className="text-gray-600 text-xs">Tab = 2 spaces · HTML + CSS + JS supported</p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl overflow-hidden border border-white/10 shadow-inner" style={{ height: "560px" }}>
                  {form.content ? (
                    <iframe
                      srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#fff;color:#111;font-family:Georgia,serif;font-size:17px;line-height:1.8;padding:24px 32px;max-width:800px;margin:0 auto;}h1,h2,h3,h4{font-family:-apple-system,sans-serif;font-weight:700;margin-top:1.5em;}a{color:#ef4444;}blockquote{border-left:4px solid #ef4444;margin:1.5em 0;padding:12px 20px;background:#fff5f5;border-radius:0 8px 8px 0;font-style:italic;color:#555;}ul,ol{padding-left:1.5em;}img{max-width:100%;border-radius:8px;}</style></head><body>${form.content}</body></html>`}
                      className="w-full h-full bg-white"
                      title="Article Preview"
                      sandbox="allow-scripts"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-white/5 text-gray-500 text-sm font-medium">
                      Write content in Code tab to see preview here
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              CARD 3 — SEARCH & METADATA
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-[#0d0d17] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <h2 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Search & Metadata
              </h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-5">
                  {/* Focus Keyword */}
                  <div>
                    <label className={labelClass}>Focus Keyword</label>
                    <input
                      type="text"
                      placeholder="Primary keyword for this article"
                      value={form.focusKeyword}
                      onChange={(e) => update("focusKeyword", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Meta Title */}
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="block text-xs text-gray-400 font-medium uppercase tracking-wider">Meta / SEO Title</label>
                      <span className={`text-[10px] font-bold ${form.seoTitle.length > 60 ? "text-red-400" : "text-gray-500"}`}>{form.seoTitle.length}/60</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Title jo Google mein dikhega (blank = article title)"
                      value={form.seoTitle}
                      onChange={(e) => update("seoTitle", e.target.value)}
                      className={inputClass}
                    />
                    <div className="mt-1.5 w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full transition-all ${form.seoTitle.length > 60 ? "bg-red-500" : form.seoTitle.length > 0 ? "bg-green-500" : "bg-transparent"}`}
                        style={{ width: `${Math.min((form.seoTitle.length / 60) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta Description */}
                  <div>
                    <div className="flex justify-between items-end mb-1.5">
                      <label className="block text-xs text-gray-400 font-medium uppercase tracking-wider">Meta Description</label>
                      <span className={`text-[10px] font-bold ${form.seoDescription.length > 160 ? "text-red-400" : "text-gray-500"}`}>{form.seoDescription.length}/160</span>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Google search result mein dikhne wala description…"
                      value={form.seoDescription}
                      onChange={(e) => update("seoDescription", e.target.value)}
                      className={inputClass}
                    />
                    <div className="mt-1.5 w-full bg-white/5 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full transition-all ${form.seoDescription.length > 160 ? "bg-red-500" : form.seoDescription.length > 0 ? "bg-green-500" : "bg-transparent"}`}
                        style={{ width: `${Math.min((form.seoDescription.length / 160) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* SEO Keywords */}
                  <div>
                    <label className={labelClass}>SEO Keywords (comma separated)</label>
                    <input
                      type="text"
                      placeholder="india china, geopolitics, defence"
                      value={form.seoKeywords}
                      onChange={(e) => update("seoKeywords", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Canonical URL */}
                  <div>
                    <label className={labelClass}>Canonical URL</label>
                    <input
                      type="text"
                      placeholder="https://www.globalchanakya.in/blogs/your-article-slug"
                      value={form.canonicalUrl}
                      onChange={(e) => update("canonicalUrl", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Robots Directive */}
                  <div>
                    <label className={labelClass}>Robots Directive</label>
                    <select
                      value={form.robots}
                      onChange={(e) => update("robots", e.target.value)}
                      className={inputClass}
                    >
                      {ROBOTS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className={selectBgClass}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* OG Image URL */}
                  <div>
                    <label className={labelClass}>OG Image URL</label>
                    <input
                      type="text"
                      placeholder="Social sharing image URL (defaults to featured image)"
                      value={form.ogImage}
                      onChange={(e) => update("ogImage", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* AI Summary */}
                  <div>
                    <label className={labelClass}>AI Summary</label>
                    <textarea
                      rows={2}
                      placeholder="AI-generated summary of the article"
                      value={form.aiSummary}
                      onChange={(e) => update("aiSummary", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              CARD 4 — EDITOR STATUS
              ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-[#0d0d17] border border-white/10 rounded-2xl overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-white/10 bg-white/5">
              <h2 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Editor Status
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Status, Visibility, Category */}
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => update("status", e.target.value as FormData["status"])}
                      className={inputClass}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value} className={selectBgClass}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Visibility</label>
                    <select
                      value={form.visibility}
                      onChange={(e) => update("visibility", e.target.value as FormData["visibility"])}
                      className={inputClass}
                    >
                      {VISIBILITY_OPTIONS.map((v) => (
                        <option key={v.value} value={v.value} className={selectBgClass}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Category *</label>
                    <select
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      className={inputClass}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className={selectBgClass}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Report Type</label>
                    <select
                      value={form.reportType}
                      onChange={(e) => update("reportType", e.target.value)}
                      className={inputClass}
                    >
                      <option value="" className={selectBgClass}>— Select —</option>
                      {REPORT_TYPES.map((rt) => (
                        <option key={rt} value={rt} className={selectBgClass}>{rt}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Scheduling & Tags */}
                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Publish Date</label>
                    <input
                      type="datetime-local"
                      value={form.publishAt}
                      onChange={(e) => update("publishAt", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Unpublish Date</label>
                    <input
                      type="datetime-local"
                      value={form.unpublishAt}
                      onChange={(e) => update("unpublishAt", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="india, china, defence"
                      value={form.tags}
                      onChange={(e) => update("tags", e.target.value)}
                      className={inputClass}
                    />
                    {form.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.tags.split(",").map((t) => t.trim()).filter(Boolean).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-[10px] font-bold tracking-wider rounded-md border border-amber-500/20">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>References (one per line)</label>
                    <textarea
                      rows={2}
                      placeholder="https://source1.com/article"
                      value={form.references}
                      onChange={(e) => update("references", e.target.value)}
                      className={`${inputClass} font-mono text-xs`}
                    />
                  </div>
                </div>

                {/* Options & Entities */}
                <div className="space-y-5">
                  {/* Toggles */}
                  <div className="space-y-3 bg-white/5 p-4 rounded-xl border border-white/5">
                    {[
                      { key: "isTrending" as keyof FormData, label: "🔥 Trending Article" },
                      { key: "commentsEnabled" as keyof FormData, label: "💬 Enable Comments" },
                      { key: "isBreaking" as keyof FormData, label: "🚨 Breaking News" },
                      { key: "isFeatured" as keyof FormData, label: "⭐ Featured Article" },
                    ].map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => update(key, !form[key])}
                          className={`w-9 h-5 rounded-full transition-all relative ${
                            form[key] ? "bg-[var(--cyan)]" : "bg-white/10"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all shadow ${
                              form[key] ? "translate-x-4" : ""
                            }`}
                          />
                        </div>
                        <span className="text-gray-300 text-xs font-medium group-hover:text-white transition-colors">
                          {label}
                        </span>
                      </label>
                    ))}
                  </div>

                  {form.isBreaking && (
                    <div>
                      <label className={labelClass}>Breaking Until</label>
                      <input type="datetime-local" value={form.breakingUntil} onChange={(e) => update("breakingUntil", e.target.value)} className={inputClass} />
                    </div>
                  )}
                  {form.isFeatured && (
                    <div>
                      <label className={labelClass}>Featured Until</label>
                      <input type="datetime-local" value={form.featuredUntil} onChange={(e) => update("featuredUntil", e.target.value)} className={inputClass} />
                    </div>
                  )}

                  {/* Linked Country */}
                  <div>
                    <label className={labelClass}>Linked Country</label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const current = form.countries.split(",").map(s => s.trim()).filter(Boolean);
                        if (!current.includes(e.target.value)) update("countries", [...current, e.target.value].join(", "));
                      }}
                      className={inputClass}
                    >
                      <option value="" className={selectBgClass}>— Add Country —</option>
                      {entityCountries.map((c) => <option key={c._id} value={c._id} className={selectBgClass}>{c.name}</option>)}
                    </select>
                    {form.countries && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.countries.split(",").map(s => s.trim()).filter(Boolean).map((id) => (
                          <span key={id} className="px-2 py-0.5 bg-blue-500/10 text-blue-300 text-[10px] rounded-md border border-blue-500/20 flex items-center gap-1">
                            {entityCountries.find(c => c._id === id)?.name || id}
                            <button type="button" onClick={() => update("countries", form.countries.split(",").map(s => s.trim()).filter(s => s !== id).join(", "))} className="hover:text-white">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Linked Leader */}
                  <div>
                    <label className={labelClass}>Linked Leader</label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const current = form.leaders.split(",").map(s => s.trim()).filter(Boolean);
                        if (!current.includes(e.target.value)) update("leaders", [...current, e.target.value].join(", "));
                      }}
                      className={inputClass}
                    >
                      <option value="" className={selectBgClass}>— Add Leader —</option>
                      {entityLeaders.map((l) => <option key={l._id} value={l._id} className={selectBgClass}>{l.name}</option>)}
                    </select>
                    {form.leaders && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.leaders.split(",").map(s => s.trim()).filter(Boolean).map((id) => (
                          <span key={id} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-[10px] rounded-md border border-purple-500/20 flex items-center gap-1">
                            {entityLeaders.find(l => l._id === id)?.name || id}
                            <button type="button" onClick={() => update("leaders", form.leaders.split(",").map(s => s.trim()).filter(s => s !== id).join(", "))} className="hover:text-white">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Linked Conflict */}
                  <div>
                    <label className={labelClass}>Linked Conflict</label>
                    <select
                      value=""
                      onChange={(e) => {
                        if (!e.target.value) return;
                        const current = form.conflicts.split(",").map(s => s.trim()).filter(Boolean);
                        if (!current.includes(e.target.value)) update("conflicts", [...current, e.target.value].join(", "));
                      }}
                      className={inputClass}
                    >
                      <option value="" className={selectBgClass}>— Add Conflict —</option>
                      {entityConflicts.map((c) => <option key={c._id} value={c._id} className={selectBgClass}>{c.name}</option>)}
                    </select>
                    {form.conflicts && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {form.conflicts.split(",").map(s => s.trim()).filter(Boolean).map((id) => (
                          <span key={id} className="px-2 py-0.5 bg-red-500/10 text-red-300 text-[10px] rounded-md border border-red-500/20 flex items-center gap-1">
                            {entityConflicts.find(c => c._id === id)?.name || id}
                            <button type="button" onClick={() => update("conflicts", form.conflicts.split(",").map(s => s.trim()).filter(s => s !== id).join(", "))} className="hover:text-white">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ Right Panel - Quick Stats ═══════ */}
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
              <p className="text-white font-medium">{wordCount}</p>
            </div>
            <div>
              <p className="text-gray-500">Read Time</p>
              <p className="text-white font-medium">~{readTime} min</p>
            </div>
            <div>
              <p className="text-gray-500">Excerpt</p>
              <p className="text-white font-medium">{form.excerpt.length}/300</p>
            </div>
            {form.focusKeyword && (
              <div>
                <p className="text-gray-500">Focus Keyword</p>
                <p className="text-amber-300 font-medium">{form.focusKeyword}</p>
              </div>
            )}
            {form.category && (
              <div>
                <p className="text-gray-500">Category</p>
                <p className="text-white font-medium">{form.category}</p>
              </div>
            )}
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
