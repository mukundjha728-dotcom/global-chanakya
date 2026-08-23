import { 
  IntelligenceItem, AskChanakyaResponse, IndiaImpactResponse, ScenarioResponse, EntityIntelligence 
} from "./types";

// These are conceptual interfaces representing future API route handlers.
// The actual implementations will be done in the backend integration phase.

export interface GetIntelligenceFeedRequest {
  region?: string;
  topic?: string;
  riskLevel?: string;
  limit?: number;
}
export interface GetIntelligenceFeedResponse {
  data: IntelligenceItem[];
}

export interface AskChanakyaApiRequest {
  query: string;
}
export interface AskChanakyaApiResponse {
  data: AskChanakyaResponse;
}

export interface GetIndiaImpactRequest {
  event: string;
}
export interface GetIndiaImpactResponse {
  data: IndiaImpactResponse;
}

export interface GetScenarioRequest {
  scenarioQuery: string;
}
export interface GetScenarioResponse {
  data: ScenarioResponse;
}

export interface GetEntityIntelligenceRequest {
  entityType: "Country" | "Leader" | "Conflict";
  slug: string;
}
export interface GetEntityIntelligenceResponse {
  data: EntityIntelligence;
}
