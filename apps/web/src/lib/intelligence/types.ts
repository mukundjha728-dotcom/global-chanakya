export type ImpactLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "NEUTRAL";
export type RiskLevel = "SEVERE" | "HIGH" | "MODERATE" | "LOW";
export type ConfidenceLevel = "VERY HIGH" | "HIGH" | "MODERATE" | "LOW";

export interface IntelligenceSource {
  name: string;
  url?: string;
  publishedTime: string;
  retrievedTime: string;
  type: "Primary" | "Government" | "Think Tank" | "Media" | "Analysis";
}

export interface EntityReference {
  id: string;
  name: string;
  type: "Country" | "Leader" | "Conflict" | "Organization";
  slug: string;
}

export interface IntelligenceItem {
  id: string;
  headline: string;
  timestamp: string;
  region: string;
  topic: string;
  summary: string;
  whyItMatters: string;
  indiaImpact: ImpactLevel;
  riskLevel: RiskLevel;
  confidence: ConfidenceLevel;
  entities: EntityReference[];
  sourceMetadata: {
    sources: IntelligenceSource[];
    sourceCount: number;
    freshness: string; // e.g., "Updated 2 hours ago"
    methodology: string;
  };
}

export interface AskChanakyaResponse {
  query: string;
  timestamp: string;
  directAssessment: string;
  strategicContext: string;
  indiaImpact: string;
  economicImpact: string;
  securityImpact: string;
  diplomaticImpact: string;
  regionalImpact: string;
  keyRisks: string[];
  scenarios: string[];
  whatToWatch: string[];
  analystAssessment: string;
  confidence: ConfidenceLevel;
  sources: IntelligenceSource[];
}

export interface ImpactDimension {
  name: string;
  level: ImpactLevel;
  description: string;
}

export interface IndiaImpactResponse {
  event: string;
  timestamp: string;
  overallImpact: ImpactLevel;
  dimensions: ImpactDimension[];
  whyItMatters: string;
  immediateEffects: string[];
  mediumTermEffects: string[];
  strategicOptions: string[];
  whatToWatch: string[];
  confidence: ConfidenceLevel;
}

export interface ScenarioPhase {
  timeframe: string; // e.g., "0-30 DAYS"
  description: string;
}

export interface ScenarioResponse {
  scenario: string;
  timestamp: string;
  immediateImpact: string;
  timeline: ScenarioPhase[];
  indiaImpact: ImpactLevel;
  indiaImpactDetails: string;
  globalImpact: string;
  energyImpact: string;
  securityImpact: string;
  diplomaticImpact: string;
  strategicResponse: string[];
  outcomes: string[];
  riskAssessment: string;
  probability: "HIGH" | "MEDIUM" | "LOW";
}

export interface EntityIntelligence {
  entityId: string;
  entityType: "Country" | "Leader" | "Conflict";
  lastUpdated: string;
  
  // Generic
  aiAssessment: string;
  currentRisks: string[];
  possibleScenarios: string[];
  
  // Country specific
  strategicPosition?: string;
  majorRelationships?: string[];
  recentDevelopments?: string[];
  economicExposure?: string;
  defenceConsiderations?: string;
  diplomaticPosition?: string;
  strategicOpportunities?: string[];
  
  // Leader specific
  strategicProfile?: string;
  currentPriorities?: string[];
  recentMoves?: string[];
  foreignPolicy?: string;
  indiaRelations?: string;
  
  // Conflict specific
  overview?: string;
  actors?: string[];
  objectives?: string[];
  currentStatus?: string;
  escalationDrivers?: string[];
  deescalationDrivers?: string[];
  regionalImpact?: string;
  indiaImpact?: string;
}
