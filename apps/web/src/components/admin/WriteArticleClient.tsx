"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useArticleEditor } from "./useArticleEditor";
import { WriteArticleContentTab } from "./WriteArticleContentTab";
import { WriteArticleSeoTab } from "./WriteArticleSeoTab";
import { WriteArticleSettingsTab } from "./WriteArticleSettingsTab";

export default function WriteArticleClient({ authorId }: { authorId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit");

  const {
    form, update, handleSave, saving, saved, publishing, setPublishing,
    publishStep, setPublishStep, activeTab, setActiveTab, editorMode, setEditorMode
  } = useArticleEditor(authorId, editId);

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all";
  const labelClass = "block text-xs text-gray-400 font-medium mb-1.5 uppercase tracking-wider";

  return (
    <div className="flex flex-col h-full relative">
      {publishing && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-[#0d0d17] border border-white/10 rounded-3xl p-10 max-w-sm w-full mx-6 text-center shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Publishing...</h3>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d0d17] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin/blogs")} className="text-gray-400 hover:text-white transition-colors text-sm">← Back</button>
          <h1 className="text-white font-semibold text-sm">{editId ? "✏️ Edit Article" : "✍️ Write New Article"}</h1>
          {saved && <span className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 px-2 py-1 rounded-full animate-pulse">✓ Saved!</span>}
        </div>
        <div className="flex items-center gap-2">
          <button id="btn-save-draft" onClick={() => handleSave(false)} disabled={saving} className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded-lg border border-white/10 transition-all disabled:opacity-50">
            {saving ? "Saving…" : "💾 Save Draft"}
          </button>
          <button id="btn-publish" onClick={() => handleSave(true)} disabled={saving} className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-lg transition-all disabled:opacity-50">
            {saving ? "Publishing…" : "🚀 Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-1 mb-6 bg-white/5 rounded-lg p-1 w-fit">
            {(["content", "seo", "settings"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${activeTab === tab ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"}`}>
                {tab === "content" ? "📝 Content" : tab === "seo" ? "🔍 SEO" : "⚙️ Settings"}
              </button>
            ))}
          </div>

          {activeTab === "content" && <WriteArticleContentTab form={form} update={update} editorMode={editorMode} setEditorMode={setEditorMode} inputClass={inputClass} labelClass={labelClass} />}
          {activeTab === "seo" && <WriteArticleSeoTab form={form} update={update} inputClass={inputClass} labelClass={labelClass} />}
          {activeTab === "settings" && <WriteArticleSettingsTab form={form} update={update} inputClass={inputClass} labelClass={labelClass} />}
        </div>
      </div>
    </div>
  );
}
