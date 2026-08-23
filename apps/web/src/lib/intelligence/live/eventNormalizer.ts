import crypto from "crypto";
import { LiveSourceItem } from "./provider.interface";
import { getTrustMetadata } from "./sourceTrust";

import mongoose from "mongoose";

export interface NormalizedIntelligenceEvent {
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: string;
  eventType: string;
  importance: number;
  sourceUrls: string[];
  sourceNames: string[];
  publishedAt: Date;
  contentHash: string;
  countries: mongoose.Types.ObjectId[];
  leaders: mongoose.Types.ObjectId[];
  conflicts: mongoose.Types.ObjectId[];
}

export interface EntityDictionary {
  countries: { id: mongoose.Types.ObjectId; name: string; aliases?: string[] }[];
  leaders: { id: mongoose.Types.ObjectId; name: string; aliases?: string[] }[];
  conflicts: { id: mongoose.Types.ObjectId; name: string; aliases?: string[] }[];
}

export class EventNormalizer {
  
  static normalize(item: LiveSourceItem, dict?: EntityDictionary): NormalizedIntelligenceEvent {
    // 1. Cleanup Text & HTML
    const title = this.cleanText(item.title);
    const description = this.cleanText(item.description);
    const content = this.cleanText(item.content || item.description);
    const fullText = (title + " " + description + " " + content).toLowerCase();
    
    // 2. Generate Slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    const slug = `${baseSlug}-${crypto.randomBytes(4).toString('hex')}`;
    
    // 3. Metadata
    const trust = getTrustMetadata(item.source);
    const category = item.category || trust.defaultCategory;
    
    // 4. Classify Event Type & Importance
    const eventType = this.classifyEventType(title, description);
    const importance = this.calculateImportance(title, description, trust.reliabilityTier);

    // 5. Deterministic Hash (exact deduplication)
    const canonicalUrl = item.url.split('?')[0].replace(/\/$/, "");
    const hashPayload = `${canonicalUrl}|${title}`;
    const contentHash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    // 6. Entity Extraction
    const countries: mongoose.Types.ObjectId[] = [];
    const leaders: mongoose.Types.ObjectId[] = [];
    const conflicts: mongoose.Types.ObjectId[] = [];

    if (dict) {
      const { matchEntity } = require("./entityResolver");
      
      const matchedCountries = matchEntity(fullText, dict.countries);
      matchedCountries.forEach((r: any) => countries.push(new mongoose.Types.ObjectId(r.entityId)));
      
      const matchedLeaders = matchEntity(fullText, dict.leaders);
      matchedLeaders.forEach((r: any) => leaders.push(new mongoose.Types.ObjectId(r.entityId)));
      
      const matchedConflicts = matchEntity(fullText, dict.conflicts, true);
      matchedConflicts.forEach((r: any) => conflicts.push(new mongoose.Types.ObjectId(r.entityId)));
    }

    return {
      title,
      slug,
      summary: description.substring(0, 500),
      content,
      category,
      eventType,
      importance,
      sourceUrls: [item.url],
      sourceNames: [item.source],
      publishedAt: item.publishedAt,
      contentHash,
      countries: Array.from(new Set(countries)),
      leaders: Array.from(new Set(leaders)),
      conflicts: Array.from(new Set(conflicts))
    };
  }

  private static cleanText(text: string): string {
    if (!text) return "";
    // Remove HTML tags
    let cleaned = text.replace(/<[^>]*>?/gm, '');
    // Decode HTML entities
    cleaned = cleaned.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
    // Normalize whitespace
    return cleaned.replace(/\s+/g, ' ').trim();
  }

  private static classifyEventType(title: string, description: string): string {
    const text = (title + " " + description).toUpperCase();
    if (text.includes("BREAKING") || text.includes("URGENT")) return "BREAKING";
    if (text.includes("ANALYSIS") || text.includes("OPINION")) return "ANALYSIS";
    if (text.includes("DIPLOMA") || text.includes("SUMMIT") || text.includes("TALKS")) return "DIPLOMACY";
    if (text.includes("MILITARY") || text.includes("DEFENCE") || text.includes("WAR")) return "CONFLICT";
    if (text.includes("ECONOM") || text.includes("MARKET") || text.includes("TRADE")) return "ECONOMY";
    if (text.includes("SANCTION")) return "SANCTIONS";
    return "DEVELOPING";
  }

  private static calculateImportance(title: string, description: string, reliabilityTier: number): number {
    let score = 30; // base score
    
    // Boost based on tier (Tier 1 gets +20, Tier 2 gets +15, etc)
    score += (6 - reliabilityTier) * 4;

    const text = (title + " " + description).toUpperCase();
    
    // Heuristic Keyword Boosts
    const heavyKeywords = ["NUCLEAR", "WAR", "INVASION", "ASSASSINATION", "RESIGN", "TREATY", "NATO", "BRICS"];
    for (const kw of heavyKeywords) {
      if (text.includes(kw)) score += 20;
    }

    const mediumKeywords = ["SANCTION", "CRISIS", "SUMMIT", "AGREEMENT", "PROTEST", "ELECTION"];
    for (const kw of mediumKeywords) {
      if (text.includes(kw)) score += 10;
    }

    return Math.min(100, Math.max(1, score)); // clamp 1-100
  }
}
