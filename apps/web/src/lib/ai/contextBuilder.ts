import { RetrievedKnowledge } from "./vectorSearch";

export interface FormattedContext {
  promptText: string;
  sources: {
    name: string;
    url: string | null;
    publishedTime: string;
    retrievedTime: string;
    type: "Primary" | "Government" | "Think Tank" | "Media" | "Analysis" | "Live Intelligence";
  }[];
}

export class ContextBuilder {
  /**
   * Formats the retrieved knowledge into a bounded text string for the prompt
   * and prepares the source array for the structured JSON response.
   */
  static build(retrievedChunks: RetrievedKnowledge[]): FormattedContext {
    if (!retrievedChunks || retrievedChunks.length === 0) {
      return { promptText: "", sources: [] };
    }

    // Group chunks
    const internalMap = new Map<string, RetrievedKnowledge>();
    const liveMap = new Map<string, RetrievedKnowledge>();
    
    for (const chunk of retrievedChunks) {
      if (chunk.isLive) {
        if (!liveMap.has(chunk.blogId)) liveMap.set(chunk.blogId, chunk);
      } else {
        if (!internalMap.has(chunk.blogId)) internalMap.set(chunk.blogId, chunk);
      }
    }

    let promptText = "";
    
    if (internalMap.size > 0) {
      promptText += `<INTERNAL_GLOBAL_CHANAKYA_RESEARCH>\n`;
      promptText += `The following are published, internal Global Chanakya analytical reports. Treat them as primary reference material.\n\n`;
      for (const [_, chunk] of internalMap.entries()) {
        const dateStr = chunk.publishedAt ? new Date(chunk.publishedAt).toISOString().split('T')[0] : "Unknown Date";
        promptText += `[Source: ${chunk.title} (${dateStr})]\n`;
        promptText += `${chunk.content}\n\n`;
      }
      promptText += `</INTERNAL_GLOBAL_CHANAKYA_RESEARCH>\n\n`;
    }

    if (liveMap.size > 0) {
      promptText += `<LIVE_INTELLIGENCE_EVENTS>\n`;
      promptText += `The following are breaking live intelligence events from external verified sources. Treat them as secondary live data.\n\n`;
      for (const [_, chunk] of liveMap.entries()) {
        const dateStr = chunk.publishedAt ? new Date(chunk.publishedAt).toISOString().split('T')[0] : "Unknown Date";
        promptText += `[Live Event: ${chunk.title} (${dateStr}) | Source: ${chunk.sourceName}]\n`;
        promptText += `${chunk.content}\n\n`;
      }
      promptText += `</LIVE_INTELLIGENCE_EVENTS>\n\n`;
    }

    // Build unique source objects
    const sources: FormattedContext["sources"] = [];
    const nowStr = new Date().toISOString();

    for (const [_, source] of internalMap.entries()) {
      sources.push({
        name: `Global Chanakya: ${source.title}`,
        url: `/intelligence/${source.slug}`,
        publishedTime: source.publishedAt ? new Date(source.publishedAt).toISOString() : nowStr,
        retrievedTime: nowStr,
        type: "Analysis"
      });
    }

    for (const [_, source] of liveMap.entries()) {
      sources.push({
        name: `${source.sourceName || "Live Source"}: ${source.title}`,
        url: source.url || null,
        publishedTime: source.publishedAt ? new Date(source.publishedAt).toISOString() : nowStr,
        retrievedTime: nowStr,
        type: "Live Intelligence"
      });
    }

    return { promptText, sources };
  }
}
