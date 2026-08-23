import { z } from "zod";

const impactLevelSchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW", "NEUTRAL"]);
const riskLevelSchema = z.enum(["SEVERE", "HIGH", "MODERATE", "LOW"]);
const confidenceLevelSchema = z.enum(["VERY HIGH", "HIGH", "MODERATE", "LOW"]);

export const liveEventEnrichmentSchema = z.object({
  whyItMatters: z.string(),
  indiaImpact: impactLevelSchema,
  riskLevel: riskLevelSchema,
  strategicSignificance: z.string(),
  confidence: confidenceLevelSchema,
});

export type LiveEventEnrichmentZodResponse = z.infer<typeof liveEventEnrichmentSchema>;

export const liveEventEnrichmentJsonSchema = {
  type: "object",
  properties: {
    whyItMatters: { type: "string" },
    indiaImpact: { type: "string", enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NEUTRAL"] },
    riskLevel: { type: "string", enum: ["SEVERE", "HIGH", "MODERATE", "LOW"] },
    strategicSignificance: { type: "string" },
    confidence: { type: "string", enum: ["VERY HIGH", "HIGH", "MODERATE", "LOW"] },
  },
  required: ["whyItMatters", "indiaImpact", "riskLevel", "strategicSignificance", "confidence"],
  additionalProperties: false
};

export const intelligenceSourceSchema = z.object({
  name: z.string(),
  url: z.string().nullable().optional(),
  publishedTime: z.string(),
  retrievedTime: z.string(),
  type: z.enum(["Primary", "Government", "Think Tank", "Media", "Analysis"]),
});

export const askChanakyaResponseSchema = z.object({
  query: z.string(),
  timestamp: z.string(),
  directAssessment: z.string(),
  strategicContext: z.string(),
  indiaImpact: z.string(),
  economicImpact: z.string(),
  securityImpact: z.string(),
  diplomaticImpact: z.string(),
  regionalImpact: z.string(),
  keyRisks: z.array(z.string()),
  scenarios: z.array(z.string()),
  whatToWatch: z.array(z.string()),
  analystAssessment: z.string(),
  confidence: confidenceLevelSchema,
  sources: z.array(intelligenceSourceSchema),
  metadata: z.object({
    ragGrounded: z.boolean().optional(),
  }).optional(),
});

export type AskChanakyaZodResponse = z.infer<typeof askChanakyaResponseSchema>;

export const askChanakyaJsonSchema = {
  type: "object",
  properties: {
    query: { type: "string" },
    timestamp: { type: "string" },
    directAssessment: { type: "string" },
    strategicContext: { type: "string" },
    indiaImpact: { type: "string" },
    economicImpact: { type: "string" },
    securityImpact: { type: "string" },
    diplomaticImpact: { type: "string" },
    regionalImpact: { type: "string" },
    keyRisks: { type: "array", items: { type: "string" } },
    scenarios: { type: "array", items: { type: "string" } },
    whatToWatch: { type: "array", items: { type: "string" } },
    analystAssessment: { type: "string" },
    confidence: { type: "string", enum: ["VERY HIGH", "HIGH", "MODERATE", "LOW"] },
    sources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          url: { type: ["string", "null"] },
          publishedTime: { type: "string" },
          retrievedTime: { type: "string" },
          type: { type: "string", enum: ["Primary", "Government", "Think Tank", "Media", "Analysis"] }
        },
        required: ["name", "url", "publishedTime", "retrievedTime", "type"],
        additionalProperties: false
      }
    }
  },
  required: [
    "query", "timestamp", "directAssessment", "strategicContext",
    "indiaImpact", "economicImpact", "securityImpact", "diplomaticImpact",
    "regionalImpact", "keyRisks", "scenarios", "whatToWatch",
    "analystAssessment", "confidence", "sources"
  ],
  additionalProperties: false
};
