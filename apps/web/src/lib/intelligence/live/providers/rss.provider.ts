import Parser from "rss-parser";
import { IntelligenceProvider, LiveSourceItem } from "../provider.interface";

export class RSSProvider implements IntelligenceProvider {
  public readonly name: string;
  private readonly feedUrl: string;
  private parser: Parser;

  constructor(name: string, feedUrl: string) {
    this.name = name;
    this.feedUrl = feedUrl;
    this.parser = new Parser({
      timeout: 10000, // 10s timeout
      headers: {
        'User-Agent': 'GlobalChanakya/1.0'
      }
    });
  }

  async fetchLatestEvents(): Promise<LiveSourceItem[]> {
    try {
      const feed = await this.parser.parseURL(this.feedUrl);
      const items: LiveSourceItem[] = [];

      for (const item of feed.items) {
        if (!item.title || !item.link) continue;
        
        items.push({
          title: item.title,
          url: item.link,
          publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
          description: item.contentSnippet || item.content || item.summary || "",
          source: this.name,
          content: item.content // We might want to keep the full HTML content for normalization
        });
      }

      return items;
    } catch (error: any) {
      console.warn(`[RSSProvider] Failed to fetch feed for ${this.name} (${this.feedUrl}):`, error.message);
      return [];
    }
  }
}
