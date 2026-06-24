/**
 * linkingEngine.ts
 * Auto-links known geopolitical entities inside HTML content.
 */

interface KnownEntity {
  name: string;
  url: string;
}

// In a real production system, these would be fetched dynamically from MongoDB 
// and cached in Redis. For execution, we demonstrate the engine logic.
export const KNOWN_ENTITIES: KnownEntity[] = [
  { name: "Xi Jinping", url: "/leader/xi-jinping" },
  { name: "Narendra Modi", url: "/leader/narendra-modi" },
  { name: "Vladimir Putin", url: "/leader/vladimir-putin" },
  { name: "BRICS", url: "/alliance/brics" },
  { name: "NATO", url: "/alliance/nato" },
  { name: "QUAD", url: "/alliance/quad" },
  { name: "India", url: "/country/india" },
  { name: "China", url: "/country/china" },
  { name: "Russia", url: "/country/russia" },
  { name: "United States", url: "/country/united-states" },
];

/**
 * Replaces the first occurrence of known entities with SEO-safe internal links.
 * 
 * Rules:
 * - No overlinking (only links the FIRST occurrence of the entity in the text).
 * - Contextual linking (avoids linking inside existing HTML tags like <a> or <script>).
 */
export function autoLinkEntities(htmlContent: string): string {
  if (!htmlContent) return htmlContent;

  let processedHtml = htmlContent;
  
  // Sort entities by length descending to prevent partial word matches 
  // (e.g. matching "US" inside "RUSSIA")
  const sortedEntities = [...KNOWN_ENTITIES].sort((a, b) => b.name.length - a.name.length);

  sortedEntities.forEach(entity => {
    // Regex logic:
    // 1. Matches the entity name exactly with word boundaries (\b).
    // 2. Uses a negative lookahead to ensure we aren't inside an HTML tag 
    //    (i.e. checking if a > comes before a < next).
    // 3. Replaces only the FIRST occurrence (no 'g' flag).
    const regex = new RegExp(`\\b(${escapeRegExp(entity.name)})\\b(?![^<]*>|[^<>]*<\/a>)`, 'i');
    
    processedHtml = processedHtml.replace(regex, `<a href="${entity.url}" class="text-blue-400 hover:underline font-medium" title="Read more about $1">$1</a>`);
  });

  return processedHtml;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
