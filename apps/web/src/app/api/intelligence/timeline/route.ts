import { NextResponse } from "next/server";
import { IntelligenceEvent } from "@/lib/models/IntelligenceEvent";
import dbConnect from "@/lib/mongoose";
import { ensureFreshLiveIntelligence } from "@/lib/intelligence/live/demandRefresh";
import { unstable_cache } from "next/cache";

export const revalidate = 60; // Cache timeline API for 60 seconds

const getCachedTimeline = unstable_cache(
  async (query: any, sortOption: any, skip: number, limit: number) => {
    await dbConnect();
    const events = await IntelligenceEvent.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit + 1) // Fetch one extra to determine hasMore
      .select("-embedding -contentHash -rawExtractedData -internalTaxonomy -rawContext") // Aggressive payload reduction
      .lean();

    const hasMore = events.length > limit;
    const paginatedEvents = hasMore ? events.slice(0, limit) : events;

    const formattedEvents = paginatedEvents.map((event: any) => ({
      id: event.slug,
      headline: event.title,
      timestamp: event.publishedAt,
      region: event.region || "Global",
      topic: event.category || "Intelligence",
      summary: event.summary,
      whyItMatters: event.whyItMatters || "No strategic summary available.",
      indiaImpact: event.indiaImpact || "NEUTRAL",
      riskLevel: event.riskLevel || "LOW",
      confidence: event.confidence || "MODERATE",
      entities: [], // Would need populated entities if desired
      sourceMetadata: {
        sources: event.sourceNames?.map((name: string, idx: number) => ({
          name,
          url: event.sourceUrls?.[idx],
          publishedTime: event.publishedAt,
          retrievedTime: event.discoveredAt,
          type: "Media"
        })) || [],
        sourceCount: event.sourceNames?.length || 1,
        freshness: "Recently Updated",
        methodology: "Real-time AI enriched extraction"
      }
    }));

    return {
      formattedEvents,
      hasMore
    };
  },
  ['intelligence-timeline-v1'],
  { revalidate: 60, tags: ['intelligence'] }
);

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Trigger demand-driven refresh safely in the background (will exit early if fresh)
    ensureFreshLiveIntelligence().catch(err => console.error("[Timeline] Demand refresh error:", err));

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = parseInt(searchParams.get("skip") || "0", 10);
    const category = searchParams.get("category");
    const eventType = searchParams.get("eventType");
    const importance = searchParams.get("importance"); // e.g. "high" for >= 70
    const region = searchParams.get("region");
    const sortParams = searchParams.get("sort") || "recent"; // "recent" | "important"

    const query: any = { 
      status: "published", 
      enrichmentStatus: "COMPLETED" 
    };
    
    if (category) query.category = category;
    if (eventType) query.eventType = eventType;
    if (importance === "high") query.importance = { $gte: 70 };
    if (region) query.region = region;

    let sortOption: any = { publishedAt: -1 };
    if (sortParams === "important") {
      sortOption = { importance: -1, publishedAt: -1 };
    }

    const { formattedEvents, hasMore } = await getCachedTimeline(query, sortOption, skip, limit);

    return NextResponse.json({
      success: true,
      data: formattedEvents,
      pagination: {
        total: 0, // Deprecated expensive count
        skip,
        limit,
        hasMore
      }
    });
  } catch (error: any) {
    console.error("[TimelineAPI] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch timeline" },
      { status: 500 }
    );
  }
}

