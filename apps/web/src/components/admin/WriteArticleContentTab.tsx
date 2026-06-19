import React from "react";
import { FormData } from "./useArticleEditor";

export function WriteArticleContentTab({
  form, update, editorMode, setEditorMode, inputClass, labelClass
}: {
  form: FormData; update: (field: keyof FormData, value: string | boolean) => void;
  editorMode: "code" | "preview"; setEditorMode: (mode: "code" | "preview") => void;
  inputClass: string; labelClass: string;
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Article Title *</label>
        <input type="text" placeholder="Title..." value={form.title} onChange={(e) => update("title", e.target.value)} className={`${inputClass} text-lg font-medium`} />
      </div>
      <div>
        <label className={labelClass}>URL Slug</label>
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-xs">/blogs/</span>
          <input type="text" value={form.slug} onChange={(e) => update("slug", e.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Excerpt (Short Summary) *</label>
        <textarea rows={3} placeholder="Summary..." value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Featured Image URL</label>
        <input type="text" placeholder="Image URL..." value={form.featuredImage} onChange={(e) => update("featuredImage", e.target.value)} className={inputClass} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Article Content *</label>
          <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
            <button type="button" onClick={() => setEditorMode("code")} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${editorMode === "code" ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"}`}>&lt;/&gt; Code</button>
            <button type="button" onClick={() => setEditorMode("preview")} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${editorMode === "preview" ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"}`}>👁 Preview</button>
          </div>
        </div>
        {editorMode === "code" ? (
          <textarea rows={28} spellCheck={false} placeholder="HTML/CSS/JS here..." value={form.content} onChange={(e) => update("content", e.target.value)} className={`${inputClass} font-mono text-sm leading-relaxed resize-y`} style={{ minHeight: "520px", tabSize: 2 }} onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const start = e.currentTarget.selectionStart;
              const end = e.currentTarget.selectionEnd;
              const val = e.currentTarget.value;
              update("content", val.substring(0, start) + "  " + val.substring(end));
            }
          }} />
        ) : (
          <div className="rounded-xl overflow-hidden border border-white/10" style={{ height: "560px" }}>
            {form.content ? (
              <iframe srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#fff;color:#111;font-family:Georgia,serif;font-size:17px;line-height:1.8;padding:24px 32px;max-width:800px;margin:0 auto;}h1,h2,h3,h4{font-family:-apple-system,sans-serif;font-weight:700;margin-top:1.5em;}a{color:#ef4444;}blockquote{border-left:4px solid #ef4444;margin:1.5em 0;padding:12px 20px;background:#fff5f5;border-radius:0 8px 8px 0;font-style:italic;color:#555;}ul,ol{padding-left:1.5em;}img{max-width:100%;border-radius:8px;}</style></head><body>${form.content}</body></html>`} className="w-full h-full bg-white" title="Preview" sandbox="allow-scripts" />
            ) : (
              <div className="h-full flex items-center justify-center bg-white/5 text-gray-600 text-sm">Preview area</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
