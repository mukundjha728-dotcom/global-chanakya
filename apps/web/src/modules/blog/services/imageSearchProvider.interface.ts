export interface ImageSearchResult {
  url: string;
  providerId: string;
  sourceUrl?: string;
  photographerName?: string;
  attributionHtml?: string;
  width?: number;
  height?: number;
}

export interface IImageSearchProvider {
  /**
   * Search for an image based on a query.
   * Returns a fully validated image URL and metadata, or null if no valid image is found.
   */
  searchImage(query: string): Promise<ImageSearchResult | null>;
}
