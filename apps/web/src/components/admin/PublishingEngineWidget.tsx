"use client";

import { useState, useEffect } from "react";
import { Zap, Play, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";

type PublishingStatus = "IDLE" | "QUEUED" | "RUNNING" | "COMPLETED" | "COMPLETED_WITH_ERRORS" | "FAILED" | "CANCELLED";

export default function PublishingEngineWidget() {
  const [status, setStatus] = useState<PublishingStatus>("IDLE");
  const [isDryRun, setIsDryRun] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    // Initial fetch
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/publishing/status");
      const data = await res.json();
      if (data.status) {
        setStatus(data.status);
        setStats(data);

        if (data.status.startsWith("COMPLETED") || data.status === "FAILED") {
          setIsPopupOpen(true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch publishing status", e);
    }
  };

  const triggerPublishing = async (dryRun: boolean) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/publishing/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDryRun: dryRun })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setIsDryRun(dryRun);
      await fetchStatus();
    } catch (e: any) {
      alert("Failed to start: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-6 bg-[var(--surface)]/60 backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold tracking-wide flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" /> Automated Intelligence Engine
          </h3>
          {status === "RUNNING" || status === "QUEUED" ? (
            <span className="flex items-center gap-2 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
              <Loader2 className="w-3 h-3 animate-spin" /> {status}
            </span>
          ) : (
            <span className="text-xs font-bold text-white/50 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              IDLE
            </span>
          )}
        </div>

        {status === "RUNNING" || status === "QUEUED" ? (
          <div className="space-y-4">
            <div className="flex justify-between text-xs text-white/60 font-medium">
              <span>Category: <span className="text-white">{stats?.currentCategory || "Initializing..."}</span></span>
              <span>Progress: {stats?.completedCategories + stats?.skippedCategories + stats?.failedCategories || 0} / {stats?.totalCategories || 0}</span>
            </div>
            
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(5, ((stats?.completedCategories + stats?.skippedCategories + stats?.failedCategories) / (stats?.totalCategories || 1)) * 100)}%` }} 
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-white/5">
              <div>
                <p className="text-white/40">Published</p>
                <p className="text-green-400 font-bold text-lg">{stats?.publishedCount || 0}</p>
              </div>
              <div>
                <p className="text-white/40">Skipped (Dups)</p>
                <p className="text-yellow-400 font-bold text-lg">{stats?.skippedCategories || 0}</p>
              </div>
              <div>
                <p className="text-white/40">Failed</p>
                <p className="text-red-400 font-bold text-lg">{stats?.failedCategories || 0}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <button
              onClick={() => triggerPublishing(false)}
              disabled={loading || stats?.publishingEnabled === false}
              title={stats?.publishingEnabled === false ? "Production publishing is disabled by server configuration" : ""}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {stats?.publishingEnabled === false ? "Publishing Disabled" : "Run Daily Publishing"}
            </button>
            <button
              onClick={() => triggerPublishing(true)}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[var(--surface)] hover:bg-white/10 border border-[var(--border)] text-white/80 font-bold py-3 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              Dry Run
            </button>
          </div>
        )}
      </div>

      {/* Completion Popup */}
      {isPopupOpen && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-center mb-4">
              {stats.status === "COMPLETED" ? (
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              ) : stats.status === "COMPLETED_WITH_ERRORS" ? (
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              )}
            </div>
            
            <h2 className="text-center text-xl font-bold text-white mb-2">
              {stats.status === "COMPLETED" 
                ? "Today's Global Chanakya intelligence publishing cycle is complete."
                : stats.status === "COMPLETED_WITH_ERRORS"
                ? "Today's publishing cycle has completed with some exceptions."
                : "Publishing Cycle Failed"}
            </h2>
            
            {stats.isDryRun && (
              <p className="text-center text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4">
                Dry Run Mode (No changes saved)
              </p>
            )}

            <div className="space-y-2 bg-[var(--surface)] p-4 rounded-xl border border-white/5 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Categories Processed:</span>
                <span className="text-white font-bold">{stats.totalCategories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Articles Published:</span>
                <span className="text-green-400 font-bold">{stats.publishedCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Skipped (Duplicates):</span>
                <span className="text-yellow-400 font-bold">{stats.skippedCategories}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Failed:</span>
                <span className="text-red-400 font-bold">{stats.failedCategories}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setIsPopupOpen(false);
                setStatus("IDLE");
              }}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
