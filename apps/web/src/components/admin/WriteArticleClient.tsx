"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useArticleEditor } from "./useArticleEditor";
import { WriteArticleContentTab } from "./WriteArticleContentTab";
import { WriteArticleSeoTab } from "./WriteArticleSeoTab";
import { WriteArticleSettingsTab } from "./WriteArticleSettingsTab";
import { PenTool, Search, Settings, Save, Send, ChevronLeft, BrainCircuit } from "lucide-react";

export default function WriteArticleClient({ authorId }: { authorId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("edit") || searchParams.get("id");

  const {
    form, update, handleSave, saving, saved, publishing, setPublishing,
    publishStep, setPublishStep, activeTab, setActiveTab, editorMode, setEditorMode
  } = useArticleEditor(authorId, editId);

  const inputClass = "w-full px-4 py-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[13px] text-white placeholder-white/30 focus:outline-none focus:border-[var(--gold)]/50 focus:shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-all";
  const labelClass = "block text-[11px] text-white/50 font-bold mb-2 uppercase tracking-[0.1em]";

  return (
    <div className="flex flex-col min-h-screen relative bg-[var(--bg)]">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-[var(--gold)]/5 to-transparent pointer-events-none" />

      {publishing && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 max-w-sm w-full mx-6 text-center shadow-[0_0_50px_rgba(212,175,55,0.1)]">
            <h3 className="text-xl font-bold text-white mb-2">Publishing Directive...</h3>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)]/50 bg-[var(--surface)]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/gc-control-9x7k/blogs")} 
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all border border-[var(--border)]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-white font-extrabold text-[15px] tracking-wide">{editId ? "Edit Intel Report" : "Draft New Report"}</h1>
            <p className="text-[var(--gold)] text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">{editId ? "Modifying Archive" : "Classified Entry"}</p>
          </div>
          {saved && <span className="ml-4 text-[var(--cyan)] text-[10px] font-bold uppercase tracking-[0.15em] bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 px-2.5 py-1 rounded-full animate-pulse">✓ Secured</span>}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleSave(false)} 
            disabled={saving} 
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-[11px] font-bold uppercase tracking-[0.1em] rounded-xl border border-[var(--border)] transition-all disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Encrypting..." : "Save Draft"}
          </button>
          <button 
            onClick={() => handleSave(true)} 
            disabled={saving} 
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[var(--gold)] to-yellow-500 hover:from-yellow-400 hover:to-yellow-300 text-black text-[11px] font-bold uppercase tracking-[0.1em] rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-3.5 h-3.5" />
            {saving ? "Transmitting..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar max-w-5xl mx-auto w-full">

          {/* Intelligence Status Card */}
          {editId && (
            <div className="mb-8 p-5 bg-[var(--surface)]/50 backdrop-blur-xl border border-[var(--border)] rounded-2xl flex items-center justify-between gap-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--gold)] to-[var(--cyan)]" />
              
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <BrainCircuit className="w-6 h-6 text-[var(--gold)]" />
                </div>
                <div>
                  <h3 className="text-white text-[13px] font-bold tracking-wide uppercase">Content Intelligence</h3>
                  <p className="text-white/40 text-[11px] font-medium mt-0.5">RAG System Synchronization Status</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex flex-col items-end">
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em] mb-1">RAG Status</span>
                  {form.chunkCount > 0 ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-[0.1em] bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_5px_#34d399]" />
                      Indexed ({form.chunkCount} Chunks)
                    </span>
                  ) : form.status === "published" ? (
                    <span className="flex items-center gap-1.5 text-[var(--gold)] text-[11px] font-bold uppercase tracking-[0.1em] bg-[var(--gold)]/10 border border-[var(--gold)]/30 px-3 py-1 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_5px_var(--gold)]" />
                      Pending Index
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-white/40 text-[11px] font-bold uppercase tracking-[0.1em] bg-white/5 border border-white/10 px-3 py-1 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                      Not Indexed
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.1em] mb-1">Embedding</span>
                  <span className="text-white text-[12px] font-medium font-mono">384-dim (Local)</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-[var(--surface)]/50 backdrop-blur-md border border-[var(--border)] rounded-xl p-1.5 w-fit shadow-lg">
            {[
              { id: "content", label: "Analysis Content", icon: PenTool },
              { id: "seo", label: "Search & Metadata", icon: Search },
              { id: "settings", label: "Report Settings", icon: Settings }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveTab(tab.id as any)} 
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[11px] font-bold uppercase tracking-[0.1em] transition-all ${
                    isActive 
                      ? "bg-[var(--gold)]/10 text-[var(--gold)] shadow-[0_0_10px_rgba(212,175,55,0.1)] border border-[var(--gold)]/20" 
                      : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${isActive ? "text-[var(--gold)]" : "opacity-50"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="bg-[var(--surface)]/40 backdrop-blur-xl border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--gold)]/30 to-transparent" />
            {activeTab === "content" && <WriteArticleContentTab form={form} update={update} editorMode={editorMode} setEditorMode={setEditorMode} inputClass={inputClass} labelClass={labelClass} />}
            {activeTab === "seo" && <WriteArticleSeoTab form={form} update={update} inputClass={inputClass} labelClass={labelClass} />}
            {activeTab === "settings" && <WriteArticleSettingsTab form={form} update={update} inputClass={inputClass} labelClass={labelClass} />}
          </div>
        </div>
      </div>
    </div>
  );
}
