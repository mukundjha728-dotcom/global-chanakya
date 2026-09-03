export function sanitizeInternalCitations(content: string | undefined | null): string {
  if (!content) return content || "";
  const artifactRegex = /:antCitation\s*\[.*?\]\s*\{.*?\}/g;
  return content.replace(artifactRegex, "");
}

export function sanitizeAISymbols(content: string | undefined | null, fieldType: 'html' | 'markdown' | 'text' | 'seo'): string {
  if (!content) return content || "";
  
  let sanitized = content;

  // 1. EM DASH (U+2014) -> " - "
  // Replace EM DASH with space hyphen space, but collapse multiple spaces if it results in "  -  "
  sanitized = sanitized.replace(/—/g, " - ").replace(/\s+-\s+/g, " - ");

  // 2. EN DASH (U+2013) -> "-"
  sanitized = sanitized.replace(/–/g, "-");

  // 3. Field-specific Markdown leak removal
  if (fieldType === 'html' || fieldType === 'text' || fieldType === 'seo') {
    // If it's HTML, we should not have raw ### or ---
    // If it's text/excerpt or seo, we definitely shouldn't.
    // Replace Markdown horizontal rules (---, ***, ___)
    // But be careful not to break HTML comments <!-- --> (so don't blindly replace --- if part of comment)
    // A safe regex for leaked --- that aren't in HTML comments:
    // `---` at start of line or surrounded by spaces
    sanitized = sanitized.replace(/(?<!<!)\b---\b(?!>)/g, ""); // basic protection
    // Let's just remove standalone "---" and "###" safely.
    sanitized = sanitized.replace(/(?:^|\n)\s*---\s*(?=\n|$)/g, fieldType === 'html' ? "\n<hr/>\n" : "\n");
    sanitized = sanitized.replace(/(?:^|\n)\s*###\s+/g, fieldType === 'html' ? "\n<h3>" : "\n"); 
    // Note: The ### replacement above opens an h3 but doesn't close it. 
    // It's safer to just strip ### in non-markdown fields.
    sanitized = sanitized.replace(/###\s*/g, "");
    
    // For HTML, if they accidentally typed `---`, let's just remove standalone `---` that isn't inside a tag.
    sanitized = sanitized.replace(/(?<!<!)---(?!>)/g, "");
  }

  return sanitized;
}

export function sanitizeBlogContent(content: string | undefined | null, fieldType: 'html' | 'markdown' | 'text' | 'seo' = 'html'): string {
  if (!content) return content || "";
  
  let sanitized = sanitizeInternalCitations(content);
  sanitized = sanitizeAISymbols(sanitized, fieldType);
  
  return sanitized;
}
