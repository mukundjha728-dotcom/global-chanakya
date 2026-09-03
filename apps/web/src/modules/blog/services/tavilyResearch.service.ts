import { tavily } from "@tavily/core";

export interface TavilySource {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
  publisher?: string;
}

export interface TavilySearchResponse {
  query: string;
  results: TavilySource[];
  primarySourcesFound: boolean;
  queriesExecuted: string[];
}

export class TavilyResearchService {
  private client: ReturnType<typeof tavily> | null = null;

  private getClient() {
    if (!this.client) {
      const apiKey = process.env.TAVILY_API_KEY;
      if (apiKey) {
        this.client = tavily({ apiKey });
      }
    }
    return this.client;
  }

  /**
   * Search the web for a specific query and return high-quality markdown sources.
   * Executes a 2-pass search: primary/official sources first, then general news.
   */
  async search(query: string, maxResults: number = 7): Promise<TavilySearchResponse> {
    console.log(`[Tavily] Executing search for topic: "${query}"`);
    
    const client = this.getClient();
    if (!client) {
      throw new Error("TAVILY_API_KEY is not configured. Live research blocked.");
    }

    const allResults: TavilySource[] = [];
    const queriesExecuted: string[] = [];
    let primarySourcesFound = false;

    // Pass 1: Primary / Official Sources
    const primaryQuery = `${query} (site:gov OR site:mil OR site:int OR "press release" OR "official statement")`;
    queriesExecuted.push(primaryQuery);
    
    try {
      console.log(`[Tavily] Pass 1 (Primary Sources): "${primaryQuery}"`);
      const primaryResponse = await client.search(primaryQuery, {
        searchDepth: "advanced",
        includeAnswer: false,
        includeImages: false,
        includeRawContent: false,
        maxResults: Math.ceil(maxResults / 2),
        topic: "news",
        days: 14 // primary sources might take slightly longer to index
      });

      if (primaryResponse.results.length > 0) {
        primarySourcesFound = true;
        primaryResponse.results.forEach((r: any) => {
          let publisher = "Unknown";
          try {
            publisher = new URL(r.url).hostname.replace('www.', '');
          } catch (e) {}

          allResults.push({
            title: r.title,
            url: r.url,
            content: r.content,
            score: r.score,
            publishedDate: r.publishedDate || r.published_date,
            publisher
          });
        });
      } else {
        console.warn(`[Tavily] No primary sources found for query.`);
      }
    } catch (error: any) {
      console.error("[Tavily] Primary search failed:", error.message);
    }

    // Pass 2: Secondary / Analytical Sources
    const secondaryQuery = `${query} news analysis`;
    queriesExecuted.push(secondaryQuery);
    const remainingResults = maxResults - allResults.length;
    
    if (remainingResults > 0) {
      try {
        console.log(`[Tavily] Pass 2 (Secondary Sources): "${secondaryQuery}"`);
        const secondaryResponse = await client.search(secondaryQuery, {
          searchDepth: "advanced",
          includeAnswer: false,
          includeImages: false,
          includeRawContent: false,
          maxResults: remainingResults,
          topic: "news",
          days: 7
        });

        secondaryResponse.results.forEach((r: any) => {
          // Avoid duplicates based on URL
          if (!allResults.some(existing => existing.url === r.url)) {
            let publisher = "Unknown";
            try {
              publisher = new URL(r.url).hostname.replace('www.', '');
            } catch (e) {}

            allResults.push({
              title: r.title,
              url: r.url,
              content: r.content,
              score: r.score,
              publishedDate: r.publishedDate || r.published_date,
              publisher
            });
          }
        });
      } catch (error: any) {
        console.error("[Tavily] Secondary search failed:", error.message);
      }
    }

    return {
      query,
      results: allResults,
      primarySourcesFound,
      queriesExecuted
    };
  }
}

export const tavilyResearchService = new TavilyResearchService();
