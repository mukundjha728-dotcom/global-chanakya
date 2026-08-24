import { liveIngestionService } from "./ingestion.service";
import dbConnect from "@/lib/mongoose";

const POLL_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

let isRunning = false;

export function startLiveIntelligenceDaemon() {
  if (isRunning) return;
  
  // To avoid running the daemon during build time or in Vercel Edge functions
  if (process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_RUNTIME === "edge") {
    return;
  }

  isRunning = true;
  console.log("[LiveIntelligenceDaemon] Starting continuous ingestion background loop (Interval: 10m)...");

  const loop = async () => {
    try {
      await dbConnect();
      console.log("[LiveIntelligenceDaemon] Polling live providers...");
      const stats = await liveIngestionService.pollAllProviders();
      console.log("[LiveIntelligenceDaemon] Polling complete. Inserted:", stats.inserted, "Duplicates:", stats.duplicates, "Failed:", stats.failed);
    } catch (err) {
      console.error("[LiveIntelligenceDaemon] Error in background loop:", err);
    } finally {
      // Schedule next run
      setTimeout(loop, POLL_INTERVAL_MS);
    }
  };

  // Start the first run after a 15-second delay to allow the server to fully boot
  setTimeout(loop, 15000); 
}
