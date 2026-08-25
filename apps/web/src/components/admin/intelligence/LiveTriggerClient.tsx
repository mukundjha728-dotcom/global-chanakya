"use client";
import { useState, useEffect } from "react";
import { Zap, Play, CheckCircle2, XCircle, AlertCircle, RefreshCw, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function LiveTriggerClient() {
  const [statusData, setStatusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/admin/intelligence/status");
      if (!res.ok) throw new Error("Failed to fetch status");
      const data = await res.json();
      setStatusData(data.status);
      setError(null);
    } catch (err: any) {
      console.error(err);
      // Don't show aggressive error if just network blip while polling
    } finally {
      setLoading(false);
    }
  };

  // Poll status when RUNNING
  useEffect(() => {
    fetchStatus();
    
    let interval: NodeJS.Timeout;
    if (statusData?.status === "RUNNING") {
      interval = setInterval(fetchStatus, 3000); // Poll every 3 seconds while running
    } else {
      interval = setInterval(fetchStatus, 30000); // Poll every 30 seconds otherwise
    }
    
    return () => clearInterval(interval);
  }, [statusData?.status]);

  const handleRunIntelligence = async () => {
    if (triggering || statusData?.status === "RUNNING") return;
    
    setTriggering(true);
    setError(null);
    
    try {
      const res = await fetch("/api/admin/intelligence/run", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        if (data.status === "already_running") {
          setError("An intelligence cycle is already running.");
          fetchStatus(); // Immediately refresh to show RUNNING state
        } else {
          setError(data.error || "Failed to trigger intelligence cycle");
        }
      } else {
        // Optimistic UI update to RUNNING
        setStatusData((prev: any) => ({ ...prev, status: "RUNNING" }));
        setTimeout(fetchStatus, 1000);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setTriggering(false);
    }
  };

  const isRunning = statusData?.status === "RUNNING";

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
            <Zap className="w-8 h-8 text-[var(--gold)]" />
            Live Intelligence Trigger
          </h1>
          <p className="text-white/60">
            Manually initiate the autonomous intelligence ingestion and generation pipeline.
          </p>
        </div>
        
        <button
          onClick={fetchStatus}
          disabled={loading || triggering}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
          title="Refresh Status"
        >
          <RefreshCw className={`w-5 h-5 text-white/70 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[var(--danger)] shrink-0 mt-0.5" />
          <div className="text-[var(--danger)]">
            <p className="font-bold">Error</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Status Card */}
        <div className="bg-[var(--surface)]/60 border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-6 pointer-events-none">
            {isRunning ? (
              <RefreshCw className="w-24 h-24 text-[var(--gold)]/5 animate-spin-slow" />
            ) : statusData?.status === "WAITING" || statusData?.status === "IDLE" ? (
              <CheckCircle2 className="w-24 h-24 text-green-500/5" />
            ) : statusData?.status === "ERROR" ? (
              <XCircle className="w-24 h-24 text-[var(--danger)]/5" />
            ) : (
              <Clock className="w-24 h-24 text-white/5" />
            )}
          </div>
          
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4">Current Status</p>
          
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-3 h-3 rounded-full shadow-[0_0_12px_currentColor] ${
              isRunning ? "bg-[var(--gold)] animate-pulse" : 
              statusData?.status === "ERROR" ? "bg-[var(--danger)]" : 
              "bg-green-500"
            }`} />
            <span className="text-2xl font-bold tracking-tight text-white capitalize">
              {statusData?.status || "Unknown"}
            </span>
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <span className="text-sm text-white/50">Last Run</span>
              <span className="text-sm font-medium text-white/90">
                {statusData?.lastPollAt ? new Date(statusData.lastPollAt).toLocaleString() : "Never"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-white/50">Last Successful Run</span>
              <span className="text-sm font-medium text-white/90">
                {statusData?.lastSuccessAt 
                  ? `${formatDistanceToNow(new Date(statusData.lastSuccessAt))} ago` 
                  : "Never"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-gradient-to-br from-[var(--cyan)]/10 to-transparent border border-[var(--cyan)]/30 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--cyan)]/20 flex items-center justify-center mb-6">
            <Zap className="w-8 h-8 text-[var(--cyan)]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Manual Intelligence Run</h3>
          <p className="text-sm text-white/60 mb-8 max-w-[280px]">
            Force an immediate intelligence pipeline cycle. This action respects all existing locks and deduplication rules.
          </p>
          
          <button
            onClick={handleRunIntelligence}
            disabled={triggering || isRunning}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-xl ${
              isRunning || triggering
                ? "bg-white/10 text-white/50 cursor-not-allowed border border-white/10"
                : "bg-[var(--cyan)] text-black hover:bg-[var(--cyan)]/90 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_var(--cyan)]"
            }`}
          >
            {triggering || isRunning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {isRunning ? "Intelligence cycle is currently processing..." : "Initiating..."}
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Intelligence Now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Latest Execution Stats */}
      <div className="bg-[var(--surface)]/60 border border-[var(--border)] rounded-2xl p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-6">Latest Execution Statistics</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/50 font-medium mb-1">Processed</p>
            <p className="text-2xl font-bold text-white">{statusData?.eventsDiscovered ?? 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/50 font-medium mb-1">Generated / Published</p>
            <p className="text-2xl font-bold text-[var(--gold)]">{statusData?.eventsPublished ?? 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/50 font-medium mb-1">Deduplicated</p>
            <p className="text-2xl font-bold text-white/80">{statusData?.eventsDeduplicated ?? 0}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/50 font-medium mb-1">Duration</p>
            <p className="text-2xl font-bold text-white/80">
              {statusData?.lastCycleDurationMs 
                ? `${(statusData.lastCycleDurationMs / 1000).toFixed(1)}s` 
                : "-"}
            </p>
          </div>
        </div>

        {statusData?.lastError && (
          <div className="mt-6 p-4 bg-[var(--danger)]/10 border-l-2 border-[var(--danger)] rounded-r-xl">
            <p className="text-xs font-bold text-[var(--danger)] uppercase mb-1">Last Pipeline Error</p>
            <p className="text-sm text-[var(--danger)]/90">{statusData.lastError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
