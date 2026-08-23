import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface FormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  countrySlug: string;
  tags: string;
  visibility: "public" | "premium" | "private";
  status: "draft" | "published" | "scheduled";
  isTrending: boolean;
  commentsEnabled: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  featuredImage: string;
  chunkCount: number;
}

export function useArticleEditor(authorId: string, editId: string | null) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState(0);
  const [activeTab, setActiveTab] = useState<"content" | "seo" | "settings">("content");
  const [editorMode, setEditorMode] = useState<"code" | "preview">("code");
  const [form, setForm] = useState<FormData>({
    title: "", slug: "", excerpt: "", content: "", category: "Geopolitics", countrySlug: "",
    tags: "", visibility: "public", status: "draft", isTrending: false,
    commentsEnabled: true, seoTitle: "", seoDescription: "", seoKeywords: "", featuredImage: "",
    chunkCount: 0,
  });

  useEffect(() => {
    if (!editId) {
      const slug = form.title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
      setForm((prev) => ({ ...prev, slug }));
    }
  }, [form.title, editId]);

  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/blogs?id=${editId}`)
        .then((r) => r.json())
        .then((blog) => {
          if (blog) {
            setForm({
              title: blog.title ?? "", slug: blog.slug ?? "", excerpt: blog.excerpt ?? "",
              content: blog.content ?? "", category: blog.category ?? "Geopolitics",
              countrySlug: blog.countrySlug ?? "",
              tags: (blog.tags ?? []).join(", "), visibility: blog.visibility ?? "public",
              status: blog.status ?? "draft", isTrending: blog.isTrending ?? false,
              commentsEnabled: blog.commentsEnabled ?? true, seoTitle: blog.seo?.title ?? "",
              seoDescription: blog.seo?.description ?? "", seoKeywords: (blog.seo?.keywords ?? []).join(", "),
              featuredImage: blog.featuredImage ?? "", chunkCount: blog.chunkCount ?? 0,
            });
          }
        });
    }
  }, [editId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        document.getElementById("btn-save-draft")?.click();
      }
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

    if (publishNow) { setPublishing(true); setPublishStep(1); } 
    else setSaving(true);

    const controller = new AbortController();
    const hardTimeout = setTimeout(() => controller.abort(), 45000);

    try {
      const payload = {
        ...form, id: editId ?? undefined, authorId,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        seo: {
          title: form.seoTitle || form.title,
          description: form.seoDescription || form.excerpt,
          keywords: form.seoKeywords.split(",").map((k) => k.trim()).filter(Boolean),
        },
        status: publishNow ? "published" : form.status,
      };

      let stepTimer: ReturnType<typeof setTimeout> | null = null;
      if (publishNow) stepTimer = setTimeout(() => setPublishStep(2), 1500);

      let res: Response;
      try {
        res = await fetch("/api/admin/blogs", {
          method: editId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
      } catch (fetchErr) {
        if (stepTimer) clearTimeout(stepTimer);
        const msg = (fetchErr as any)?.name === "AbortError" ? "Request timed out." : "Network error.";
        if (publishNow) { setPublishing(false); setPublishStep(0); } else setSaving(false);
        alert(msg);
        return;
      }

      if (stepTimer) clearTimeout(stepTimer);

      if (res.ok) {
        if (publishNow) {
          setPublishStep(3);
          setTimeout(() => {
            setPublishing(false); setPublishStep(0); router.push("/admin/blogs");
          }, 1500);
        } else {
          setSaved(true); setTimeout(() => setSaved(false), 3000);
        }
      } else {
        let errMsg = `Server Error (${res.status})`;
        try {
          const errBody = await res.json(); errMsg = errBody.error ?? errMsg;
        } catch { errMsg = `Server Error ${res.status}`; }
        if (publishNow) { setPublishing(false); setPublishStep(0); }
        alert(`❌ Error: ${errMsg}`);
      }
    } finally {
      clearTimeout(hardTimeout);
      if (!publishNow) setSaving(false);
    }
  }

  return { form, update, handleSave, saving, saved, publishing, setPublishing, publishStep, setPublishStep, activeTab, setActiveTab, editorMode, setEditorMode };
}
