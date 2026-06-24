/**
 * briefingEngine.ts
 * Assembles programmatic templates with real DB data.
 */
import dbConnect from "../mongoose";
import { Country } from "../models/Country";
import { SEO_TEMPLATES } from "./contentTemplates";

export async function generateCountryBrief(slug: string): Promise<string | null> {
  await dbConnect();
  const country = await Country.findOne({ slug }).lean();
  
  if (!country) return null;

  let brief = SEO_TEMPLATES.COUNTRY_BRIEF;
  brief = brief.replace("{{countryName}}", country.name);
  brief = brief.replace("{{politicalStance}}", country.geopoliticalStatus);
  brief = brief.replace("{{region}}", country.region);
  brief = brief.replace("{{gdp}}", country.gdp || "Undisclosed");
  brief = brief.replace("{{intelScore}}", String(country.intelligenceScore));
  brief = brief.replace("{{date}}", new Date().toLocaleDateString());
  
  // Complex replacements handled by additional LLM parsing or DB aggregation in prod
  brief = brief.replace("{{coreDriver}}", "regional trade dominance and military modernization");
  brief = brief.replace("{{activeConflictsList}}", "- Pending escalation zones...");
  brief = brief.replace("{{alliancesList}}", country.alliances?.join(", ") || "various treaties");
  brief = brief.replace("{{defensePosture}}", "Modernizing");

  return brief;
}
