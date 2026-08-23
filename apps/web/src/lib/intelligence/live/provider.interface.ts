export interface LiveSourceItem {
  title: string;
  url: string;
  publishedAt: Date;
  description: string;
  source: string; // mapped to constants in sourceTrust.ts
  category?: string;
  content?: string;
}

export interface IntelligenceProvider {
  /**
   * Identifies the provider for logging and status tracking.
   */
  readonly name: string;
  
  /**
   * Fetches latest events from the provider's source.
   */
  fetchLatestEvents(): Promise<LiveSourceItem[]>;
}
