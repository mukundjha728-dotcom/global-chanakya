import React from "react";
import { FormData } from "./useArticleEditor";

export function WriteArticleSeoTab({ form, update, inputClass, labelClass }: { form: FormData; update: (field: keyof FormData, value: string | boolean) => void; inputClass: string; labelClass: string; }) {
  return (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>SEO Title</label>
        <input type="text" placeholder="SEO Title" value={form.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} className={inputClass} />
        <p className="text-gray-600 text-xs mt-1">{(form.seoTitle || form.title).length}/60</p>
      </div>
      <div>
        <label className={labelClass}>Meta Description</label>
        <textarea rows={3} placeholder="Meta Description" value={form.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} className={inputClass} />
        <p className="text-gray-600 text-xs mt-1">{form.seoDescription.length}/160</p>
      </div>
      <div>
        <label className={labelClass}>SEO Keywords</label>
        <input type="text" placeholder="keywords..." value={form.seoKeywords} onChange={(e) => update("seoKeywords", e.target.value)} className={inputClass} />
      </div>
    </div>
  );
}
