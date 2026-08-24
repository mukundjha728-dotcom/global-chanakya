import { IntelligenceEvent } from "../../models/IntelligenceEvent";
import { SystemConfig } from "../../models/SystemConfig";
import { redis } from "../../redis";
import { RSSProvider } from "./providers/rss.provider";
import { EventNormalizer, EntityDictionary } from "./eventNormalizer";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import { findLiveSemanticMatches } from "@/lib/ai/vectorSearch";
import { groqProvider, RateLimitError } from "@/lib/ai/providers/groq.provider";
import { liveEventEnrichmentJsonSchema, liveEventEnrichmentSchema } from "../validators";
import { Country } from "../../models/Country";
import { Leader } from "../../models/Leader";
import { Conflict } from "../../models/Conflict";

// For standalone worker this can run much longer. For Vercel/edge keep at 50s.
const MAX_EXECUTION_BUDGET_MS = Number(process.env.INGESTION_BUDGET_MS) || 300000; // 5 min for worker, override to 50s in Vercel env

export class LiveIngestionService {
  private providers = [
    new RSSProvider("BBC", "http://feeds.bbci.co.uk/news/world/rss.xml"),
    new RSSProvider("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
    new RSSProvider("UN News", "https://news.un.org/feed/subscribe/en/news/all/rss.xml")
  ];

  async pollAllProviders() {
    console.log("[LiveIngestionService] Starting live intelligence ingestion...");
    const stats = { fetched: 0, normalized: 0, duplicates: 0, inserted: 0, failed: 0, archived: 0, providersHealthy: 0, providersFailed: 0 };
    const tStart = performance.now();

    const dict = await this.loadEntityDictionary();
    stats.archived = await this.pruneStaleEvents();

    // Process retry queue for stranded drafts (Phase 7.0: also catches null enrichmentStatus)
    await this.processRetryQueue(tStart, stats);

    const fetchPromises: Promise<any>[] = [];
    const executing = new Set<Promise<any>>();
    
    for (const p of this.providers) {
      const prm = this.pollProviderSafe(p, dict, tStart).then(r => {
        executing.delete(prm);
        return r;
      });
      fetchPromises.push(prm);
      executing.add(prm);
      if (executing.size >= 2) {
        await Promise.race(executing);
      }
    }
    
    const providerResults = await Promise.all(fetchPromises);

    let hasNewInserts = false;
    for (const r of providerResults) {
      stats.fetched += r.fetched;
      stats.normalized += r.normalized;
      stats.duplicates += r.duplicates;
      stats.inserted += r.inserted;
      stats.failed += r.failed;
      if (r.status === 'healthy') stats.providersHealthy++;
      if (r.status === 'failed') stats.providersFailed++;
      if (r.inserted > 0) hasNewInserts = true;
    }

    if (hasNewInserts) {
      await this.incrementLiveCorpusVersion();
    }

    const durationMs = performance.now() - tStart;
    await this.logTelemetry(stats, durationMs);
    
    return stats;
  }

  private async pollProviderSafe(provider: RSSProvider, dict: EntityDictionary, tStart: number) {
    const stats = { fetched: 0, normalized: 0, duplicates: 0, inserted: 0, failed: 0, status: 'healthy' };
    const circuitBreakerKey = `circuit_breaker:rss:${provider.name.replace(/\s+/g, '_')}`;
    const failures = await redis.get<number>(circuitBreakerKey) || 0;
    
    if (failures >= 3) {
      console.warn(`[LiveIngestionService] Circuit Breaker open for ${provider.name}. Skipping.`);
      stats.status = 'failed';
      return stats;
    }

    try {
      console.log(`[LiveIngestionService] Polling ${provider.name}...`);
      
      const rawEvents = await Promise.race([
        provider.fetchLatestEvents(),
        new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error("RSS Fetch Timeout")), 15000))
      ]);
      
      stats.fetched += rawEvents.length;
      if (failures > 0) await redis.set(circuitBreakerKey, 0, "EX", 86400);

      console.log(`[LiveIngestionService] ${provider.name}: ${rawEvents.length} items received from feed.`);

      const itemsToEmbed: any[] = [];

      for (const item of rawEvents) {
        if (performance.now() - tStart > MAX_EXECUTION_BUDGET_MS) {
          console.warn(`[LiveIngestionService] Execution budget exceeded. Stopping ingestion for ${provider.name}.`);
          break;
        }

        try {
          const normalized = EventNormalizer.normalize(item, dict);
          stats.normalized++;

          const exactDup = await IntelligenceEvent.findOne({ contentHash: normalized.contentHash }).lean();
          if (exactDup) {
            stats.duplicates++;
            continue;
          }

          itemsToEmbed.push(normalized);
        } catch (err: any) {
          console.warn(`[LiveIngestionService] Normalization failed for ${provider.name}:`, err.message);
          stats.failed++;
        }
      }

      console.log(`[LiveIngestionService] ${provider.name}: ${itemsToEmbed.length} new items to process after exact dedup.`);

      for (let i = 0; i < itemsToEmbed.length; i += 5) {
        if (performance.now() - tStart > MAX_EXECUTION_BUDGET_MS) break;

        const batch = itemsToEmbed.slice(i, i + 5);
        for (const normalized of batch) {
          try {
            // 1. Generate embedding for vector dedup
            const embedding = await generateEmbeddings(normalized.content);
            const semanticMatches = await findLiveSemanticMatches(embedding, 1, 0.95);
            
            if (semanticMatches.length > 0) {
              // PHASE 6.9: UPDATE EXISTING INSTEAD OF DUPLICATING
              const matchedId = semanticMatches[0].blogId;
              const existingEvent = await IntelligenceEvent.findById(matchedId);
              
              if (existingEvent) {
                let hasChanges = false;
                
                if (normalized.sourceUrls?.[0] && !existingEvent.sourceUrls.includes(normalized.sourceUrls[0])) {
                  existingEvent.sourceUrls.push(normalized.sourceUrls[0]);
                  hasChanges = true;
                }
                
                if (normalized.sourceNames?.[0] && !existingEvent.sourceNames.includes(normalized.sourceNames[0])) {
                  existingEvent.sourceNames.push(normalized.sourceNames[0]);
                  hasChanges = true;
                }
                
                // Reactivate if archived and properly enriched
                if (existingEvent.status === "archived" && existingEvent.enrichmentStatus === "COMPLETED") {
                  existingEvent.status = "published";
                  hasChanges = true;
                }
                
                if (hasChanges) {
                  await existingEvent.save(); // bumps updatedAt
                }
                
                stats.duplicates++;
                continue;
              }
            }
            
            // 2. Genuinely new event — enrich
            let finalEnrichment: any = null;
            let enrichmentStatus = "PENDING";
            
            finalEnrichment = await this.enrichEvent(normalized, tStart);
            if (finalEnrichment) {
               enrichmentStatus = "COMPLETED";
            } else {
               enrichmentStatus = "FAILED";
            }

            const eventDoc = new IntelligenceEvent({
              ...normalized,
              embedding,
              embeddingModel: "Xenova/all-MiniLM-L6-v2",
              embeddingDimensions: 384,
              ...(finalEnrichment || {}),
              enrichmentStatus,
              status: enrichmentStatus === "COMPLETED" ? "published" : "draft"
            });

            stats.inserted++;
            await eventDoc.save();
            console.log(`[LiveIngestionService] ✅ Published: "${normalized.title.substring(0, 60)}..."`);
          } catch (err: any) {
            console.warn(`[LiveIngestionService] Insert failed for item from ${provider.name}:`, err.message);
            stats.failed++;
          }
        }
      }

    } catch (err: any) {
      console.error(`[LiveIngestionService] Provider ${provider.name} failed entirely:`, err.message);
      stats.status = 'failed';
      await redis.set(circuitBreakerKey, failures + 1, "EX", 86400);
    }

    return stats;
  }

  private async processRetryQueue(tStart: number, stats: any) {
    try {
      // PHASE 7.0 FIX: catch null/undefined enrichmentStatus AND FAILED status
      const failedEvents = await IntelligenceEvent.find({ 
        status: "draft",
        $or: [
          { enrichmentStatus: "FAILED" },
          { enrichmentStatus: null },
          { enrichmentStatus: { $exists: false } }
        ]
      }).limit(5); // Limit to 5 per cycle to avoid overwhelming the budget
      
      if (failedEvents.length > 0) {
        console.log(`[LiveIngestionService] Retrying ${failedEvents.length} stranded draft events...`);
      }
      
      for (const event of failedEvents) {
        if (performance.now() - tStart > MAX_EXECUTION_BUDGET_MS) break;

        const finalEnrichment = await this.enrichEvent(event, tStart);
        if (finalEnrichment) {
           Object.assign(event, finalEnrichment);
           event.enrichmentStatus = "COMPLETED";
           event.status = "published";
           await event.save();
           stats.inserted++;
           console.log(`[LiveIngestionService] Retry success: "${event.slug}"`);
        } else {
           // Mark as explicitly FAILED so we can track them properly
           if (!event.enrichmentStatus) {
             event.enrichmentStatus = "FAILED";
             await event.save();
           }
        }
      }
    } catch (e: any) {
      console.warn("[LiveIngestionService] Failed to process retry queue:", e.message);
    }
  }

  private async enrichEvent(normalized: any, tStart: number): Promise<any> {
    // For standalone worker, use a much more generous timeout
    const TOTAL_TIMEOUT_BUDGET = MAX_EXECUTION_BUDGET_MS > 100000 ? 30000 : 15000;
    const maxRetries = 2;
    let attempt = 0;
    let enrichmentData = null;

    const systemPrompt = `
IDENTITY: Global Chanakya Intelligence — AI Enrichment Engine.
RULES:
1. STRICT JSON OUTPUT ONLY.
2. Use ONLY the <UNTRUSTED_SOURCE_DATA> provided. DO NOT invent geopolitical facts, entities, dates, or implications.
3. For India Impact: If the source material does not support a meaningful connection to India's strategic, economic, diplomatic, defence, energy, trade, technology, or regional interests, you MUST return "NEUTRAL". NEVER invent an India connection.
4. Assess riskLevel and confidence based solely on the text provided.
    `.trim();

    const userPrompt = `
<UNTRUSTED_SOURCE_DATA>
TITLE: ${normalized.title}
SUMMARY: ${normalized.summary}
CONTENT: ${normalized.content}
</UNTRUSTED_SOURCE_DATA>

Extract the structured intelligence fields from the source data above.
    `.trim();

    while (attempt <= maxRetries) {
      const elapsedTotal = performance.now() - tStart;
      if (elapsedTotal > TOTAL_TIMEOUT_BUDGET) break;

      try {
        const remainingBudget = Math.max(10000, TOTAL_TIMEOUT_BUDGET - elapsedTotal);
        const response = await Promise.race([
          groqProvider.generateStructured({
            model: process.env.GROQ_DEFAULT_MODEL || "llama3-8b-8192",
            systemPrompt,
            userPrompt,
            schema: liveEventEnrichmentJsonSchema as Record<string, unknown>,
            schemaName: "LiveEventEnrichment",
            temperature: 0.1,
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Groq Timeout")), remainingBudget))
        ]);

        const validationResult = liveEventEnrichmentSchema.safeParse((response as any).data);
        if (!validationResult.success) {
           throw new Error("AI Validation Error: " + validationResult.error.message);
        }
        
        enrichmentData = validationResult.data;
        break;
      } catch (err: any) {
        console.warn(`[LiveIngestionService] Enrichment attempt ${attempt + 1} failed:`, err.message);
        attempt++;
        if (attempt <= maxRetries) {
           let delayMs = Math.pow(2, attempt - 1) * 1000;
           if (err instanceof RateLimitError && err.retryAfterMs) {
             delayMs = err.retryAfterMs;
           }
           const jitter = delayMs * 0.1 * (Math.random() * 2 - 1);
           await new Promise(res => setTimeout(res, Math.max(delayMs + jitter, 100)));
        }
      }
    }
    
    return enrichmentData;
  }

  private async loadEntityDictionary(): Promise<EntityDictionary> {
    const dict: EntityDictionary = { countries: [], leaders: [], conflicts: [] };
    try {
      const [countries, leaders, conflicts] = await Promise.all([
        Country.find({ status: { $ne: "inactive" } }).select("_id name aliases").lean(),
        Leader.find({ status: { $ne: "inactive" } }).select("_id name aliases").lean(),
        Conflict.find({ status: { $ne: "inactive" } }).select("_id name aliases").lean()
      ]);
      dict.countries = countries.map(c => ({ _id: (c as any)._id, name: (c as any).name, aliases: (c as any).aliases || [] }));
      dict.leaders = leaders.map(l => ({ _id: (l as any)._id, name: (l as any).name, aliases: (l as any).aliases || [] }));
      dict.conflicts = conflicts.map(c => ({ _id: (c as any)._id, name: (c as any).name, aliases: (c as any).aliases || [] }));
    } catch (e) {
      console.warn("[LiveIngestionService] Failed to load entity dictionary", e);
    }
    return dict;
  }

  private async pruneStaleEvents(): Promise<number> {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      // Phase 6.9: dual condition — both publishedAt AND updatedAt must be stale
      // Phase 7.0 FIX: Only archive COMPLETED events. Never archive PENDING (awaiting enrichment).
      const result = await IntelligenceEvent.updateMany(
        { 
          status: "published",
          enrichmentStatus: "COMPLETED",   // ← CRITICAL: never archive pending/failed
          publishedAt: { $lt: sevenDaysAgo },
          updatedAt: { $lt: sevenDaysAgo }
        },
        { $set: { status: "archived" } }
      );
      if (result.modifiedCount > 0) {
        console.log(`[LiveIngestionService] Archived ${result.modifiedCount} stale events.`);
      }
      return result.modifiedCount || 0;
    } catch (e) {
      console.warn("[LiveIngestionService] Failed to prune stale events", e);
      return 0;
    }
  }

  private async incrementLiveCorpusVersion() {
    try {
      const config = await SystemConfig.findOneAndUpdate(
        { isActive: true },
        { $inc: { liveCorpusVersion: 1 } },
        { new: true }
      );
      if (config) {
        await redis.set("live_corpus_version", config.liveCorpusVersion, "EX", 86400);
      }
    } catch (err) {
      console.error("[LiveIngestionService] Failed to increment liveCorpusVersion:", err);
    }
  }

  private async logTelemetry(stats: any, durationMs: number) {
    const telemetry = {
      timestamp: new Date().toISOString(),
      providers: this.providers.length,
      fetched: stats.fetched,
      normalized: stats.normalized,
      duplicates: stats.duplicates,
      inserted: stats.inserted,
      failed: stats.failed,
      archived: stats.archived,
      durationMs: Math.round(durationMs)
    };
    console.log(`[LIVE_INGESTION_LATENCY] \n${JSON.stringify(telemetry, null, 2)}`);
    try {
      await redis.set("live_ingestion_stats", telemetry, "EX", 86400 * 7);
    } catch (e) {}
  }
}

export const liveIngestionService = new LiveIngestionService();
