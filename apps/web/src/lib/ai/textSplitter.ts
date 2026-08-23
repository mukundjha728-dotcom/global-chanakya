import crypto from 'crypto';

export interface TextChunk {
  content: string;
  metadata: {
    sectionTitle?: string;
    parentHeading?: string;
  };
}

export class MarkdownSplitter {
  /**
   * Extremely simple but effective Markdown heading-aware splitter.
   * Target ~700-900 words per chunk.
   */
  static splitText(text: string, maxWords = 800): TextChunk[] {
    const chunks: TextChunk[] = [];
    
    // Split by major headers (## or ###)
    // The regex captures the header level, the title, and the body text until the next header
    const headerRegex = /(^|\n)(#{2,3})\s+(.*?)\n([\s\S]*?)(?=\n#{2,3}\s|$)/g;
    
    let match;
    let currentParentHeading = "Introduction";
    
    // If the text doesn't start with a header, grab the intro
    const introMatch = text.match(/^([^#]+)/);
    if (introMatch && introMatch[1].trim()) {
      this.chunkByLength(introMatch[1].trim(), maxWords, { sectionTitle: "Introduction" }, chunks);
    }

    while ((match = headerRegex.exec(text)) !== null) {
      const level = match[2]; // ## or ###
      const title = match[3].trim();
      const body = match[4].trim();
      
      if (level === '##') {
        currentParentHeading = title;
      }
      
      if (body) {
        this.chunkByLength(body, maxWords, { 
          sectionTitle: title,
          parentHeading: level === '###' ? currentParentHeading : undefined
        }, chunks);
      }
    }
    
    // Fallback if no headers found at all
    if (chunks.length === 0 && text.trim()) {
      this.chunkByLength(text.trim(), maxWords, {}, chunks);
    }
    
    return chunks;
  }
  
  private static chunkByLength(text: string, maxWords: number, metadata: any, output: TextChunk[]) {
    const words = text.split(/\s+/);
    let currentChunk: string[] = [];
    
    for (let i = 0; i < words.length; i++) {
      currentChunk.push(words[i]);
      
      if (currentChunk.length >= maxWords) {
        output.push({
          content: metadata.sectionTitle ? `## ${metadata.sectionTitle}\n${currentChunk.join(" ")}` : currentChunk.join(" "),
          metadata: { ...metadata }
        });
        
        // 100 word overlap
        const overlap = currentChunk.slice(-100);
        currentChunk = [...overlap];
      }
    }
    
    if (currentChunk.length > 100 || (currentChunk.length > 0 && output.length === 0)) {
       output.push({
          content: metadata.sectionTitle ? `## ${metadata.sectionTitle}\n${currentChunk.join(" ")}` : currentChunk.join(" "),
          metadata: { ...metadata }
        });
    }
  }

  static generateHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}
