import { IImageSearchProvider, ImageSearchResult } from "./imageSearchProvider.interface";

export class WikipediaImageService implements IImageSearchProvider {
  private userAgent = 'GlobalChanakyaPublishingEngine/1.0 (contact@globalchanakya.in)';
  
  /**
   * Generates search query fallbacks in case the primary query fails.
   */
  private generateFallbacks(query: string): string[] {
    const fallbacks = [query];
    
    // Create a reduced query by taking the first 2-3 significant words
    const words = query.split(' ').filter(w => w.length > 2);
    if (words.length > 2) {
      fallbacks.push(words.slice(0, 2).join(' '));
    }
    
    // Extreme fallback: first significant word
    if (words.length > 1) {
      fallbacks.push(words[0]);
    }
    
    // Add safe generic fallback as absolute last resort
    fallbacks.push("Geopolitics");
    
    // Ensure uniqueness
    return Array.from(new Set(fallbacks));
  }

  /**
   * Verifies if a URL is reachable and represents an image via a HEAD request.
   */
  private async verifyImageUrl(url: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        headers: { 'User-Agent': this.userAgent },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) return false;
      
      const contentType = response.headers.get('content-type');
      return contentType ? contentType.startsWith('image/') : false;
    } catch (e) {
      return false;
    }
  }

  /**
   * Safely strip HTML tags from attribution
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>?/gm, '').trim();
  }

  private isLogoOrSeal(filename: string, description: string = ''): boolean {
    const lowerName = filename.toLowerCase();
    const lowerDesc = description.toLowerCase();
    
    if (lowerName.endsWith('.svg')) return true;
    if (lowerName.includes('logo') || lowerName.includes('seal') || lowerName.includes('emblem') || lowerName.includes('flag')) return true;
    if (lowerDesc.includes('logo') || lowerDesc.includes('seal') || lowerDesc.includes('emblem')) return true;
    
    return false;
  }

  async searchImage(query: string): Promise<ImageSearchResult | null> {
    const queriesToTry = this.generateFallbacks(query);
    let logoFallback: ImageSearchResult | null = null;
    
    for (const currentQuery of queriesToTry) {
      try {
        console.log(`[WikipediaImageService] Attempting search with query: "${currentQuery}"`);
        
        // 1. Search for the most relevant Wikipedia page
        const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(currentQuery)}&utf8=&format=json&srlimit=1`;
        
        const searchRes = await fetch(searchUrl, {
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (!searchRes.ok) continue;
        const searchData = await searchRes.json();
        
        if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
          continue; // Try next fallback
        }
        
        const title = searchData.query.search[0].title;
        
        // 2. Fetch all images (not just pageimage) for that article
        const imgUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=images&titles=${encodeURIComponent(title)}&imlimit=10&format=json`;
        const imgRes = await fetch(imgUrl, {
          headers: { 'User-Agent': this.userAgent }
        });
        
        if (!imgRes.ok) continue;
        const imgData = await imgRes.json();
        
        const pages = imgData.query?.pages;
        if (!pages) continue;
        
        const pageId = Object.keys(pages)[0];
        const page = pages[pageId];
        
        if (!page.images || page.images.length === 0) {
          continue; 
        }

        // Evaluate all images in the article to find the best one
        for (const img of page.images) {
          const filename = img.title;
          
          // Skip icons and structural UI images
          if (filename.toLowerCase().includes('icon') || filename.toLowerCase().includes('commons-logo')) continue;

          // Fetch info
          const iiUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata|url&titles=${encodeURIComponent(filename)}&format=json`;
          const iiRes = await fetch(iiUrl, { headers: { 'User-Agent': this.userAgent } });
          
          if (!iiRes.ok) continue;
          
          const iiData = await iiRes.json();
          const iiPages = iiData.query?.pages;
          if (!iiPages) continue;
          
          const iiPageId = Object.keys(iiPages)[0];
          const iiPage = iiPages[iiPageId];
          
          if (iiPage.imageinfo && iiPage.imageinfo.length > 0) {
            const info = iiPage.imageinfo[0];
            const originalUrl = info.url;
            
            // Prefer original URL if it's reasonably sized, but thumb is safer
            // We'll construct a 1280px thumb URL
            const thumbUrl = `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(filename.replace('File:', ''))}&width=1280`;

            let attributionHtml = '';
            let photographerName = 'Wikimedia Commons';
            let description = '';

            if (info.extmetadata) {
              const artist = info.extmetadata.Artist?.value;
              const license = info.extmetadata.LicenseShortName?.value || info.extmetadata.License?.value;
              const descObj = info.extmetadata.ImageDescription?.value;
              
              if (artist) photographerName = this.stripHtml(artist);
              if (descObj) description = this.stripHtml(descObj);
              
              let attrParts = [];
              if (photographerName !== 'Wikimedia Commons') attrParts.push(`By ${photographerName}`);
              if (license) attrParts.push(`License: ${this.stripHtml(license)}`);
              if (attrParts.length > 0) attributionHtml = attrParts.join(' | ');
            }
            
            const isFallbackType = this.isLogoOrSeal(filename, description);
            
            const candidate: ImageSearchResult = {
              url: thumbUrl,
              providerId: `wiki_${filename}`,
              sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`,
              photographerName,
              attributionHtml,
              width: 1280,
              height: 720 // Approx
            };

            const isValid = await this.verifyImageUrl(thumbUrl);
            if (!isValid) continue;

            if (isFallbackType) {
              if (!logoFallback) logoFallback = candidate; // save as absolute last resort
              continue; // keep looking for a better image
            }

            // If we made it here, we have a valid photograph/map/document that isn't a logo/seal!
            return candidate;
          }
        }
      } catch (e) {
        console.error(`[WikipediaImageService] Error during search for "${currentQuery}":`, e);
      }
    }
    
    // If we only found a logo, return it as the final fallback
    if (logoFallback) {
      console.log("[WikipediaImageService] Returning logo/seal as final fallback.");
      return logoFallback;
    }
    
    return null;
  }
}
