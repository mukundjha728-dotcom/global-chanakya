import mongoose from "mongoose";
import { Country } from "@/lib/models/Country";
import { Leader } from "@/lib/models/Leader";
import { Conflict } from "@/lib/models/Conflict";

export interface ResolvedEntity {
  entityId: string;
  entityName: string;
  matchedTerm: string;
  matchType: "exact_name" | "exact_normalized_name" | "exact_alias" | "exact_normalized_alias" | "bounded_token";
}

// Helper to normalize strings for case-insensitive matching without punctuation
function normalize(str: string) {
  return str.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

export function matchEntity(text: string, entities: any[], isConflict = false): ResolvedEntity[] {
  const resolved: ResolvedEntity[] = [];
  const normalizedText = normalize(text);
  const textWords = new Set(normalizedText.split(/\s+/));

  for (const entity of entities) {
    const name = entity.name;
    const normName = normalize(name);
    
    let matched = false;

    // 1. Exact canonical name (case-sensitive) with word boundary check
    const nameRegex = new RegExp(`(?:^|\\W)${escapeRegExp(name)}(?:\\W|$)`);
    if (nameRegex.test(text)) {
      resolved.push({ entityId: entity._id.toString(), entityName: name, matchedTerm: name, matchType: "exact_name" });
      continue;
    }

    // 2. Exact normalized canonical name with word boundary
    const normNameRegex = new RegExp(`(?:^|\\W)${escapeRegExp(normName)}(?:\\W|$)`);
    if (normNameRegex.test(normalizedText) && normName.length > 2) {
      resolved.push({ entityId: entity._id.toString(), entityName: name, matchedTerm: normName, matchType: "exact_normalized_name" });
      continue;
    }

    // 3 & 4. Exact alias and normalized alias
    for (const alias of entity.aliases || []) {
      const aliasRegex = new RegExp(`(?:^|\\W)${escapeRegExp(alias)}(?:\\W|$)`);
      if (aliasRegex.test(text)) {
        resolved.push({ entityId: entity._id.toString(), entityName: name, matchedTerm: alias, matchType: "exact_alias" });
        matched = true;
        break;
      }
      const normAlias = normalize(alias);
      const normAliasRegex = new RegExp(`(?:^|\\W)${escapeRegExp(normAlias)}(?:\\W|$)`);
      if (normAliasRegex.test(normalizedText) && normAlias.length > 2) {
        resolved.push({ entityId: entity._id.toString(), entityName: name, matchedTerm: normAlias, matchType: "exact_normalized_alias" });
        matched = true;
        break;
      }
    }
    
    if (matched) continue;

    // 5. Bounded token matching
    // Only match if all tokens in the normalized name are present in the text as distinct words
    const nameTokens = normName.split(/\s+/);
    if (nameTokens.length > 1 && nameTokens.every(token => textWords.has(token))) {
       resolved.push({ entityId: entity._id.toString(), entityName: name, matchedTerm: normName, matchType: "bounded_token" });
    }
  }

  // Deduplicate and filter out ambiguous overlaps if any
  const unique = Array.from(new Map(resolved.map(r => [r.entityId, r])).values());
  return unique;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export class EntityResolver {
  static async resolveCountries(text: string): Promise<ResolvedEntity[]> {
    const countries = await Country.find({ status: { $ne: "inactive" } }).lean();
    return matchEntity(text, countries);
  }

  static async resolveLeaders(text: string): Promise<ResolvedEntity[]> {
    const leaders = await Leader.find({ status: { $ne: "inactive" } }).lean();
    return matchEntity(text, leaders);
  }

  static async resolveConflicts(text: string): Promise<ResolvedEntity[]> {
    const conflicts = await Conflict.find({ status: { $ne: "inactive" } }).lean();
    return matchEntity(text, conflicts, true);
  }
}
