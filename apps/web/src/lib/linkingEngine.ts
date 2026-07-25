/**
 * linkingEngine.ts
 * Auto-links known geopolitical entities inside HTML content.
 * Note: Entity linking (leaders, countries, alliances) has been removed.
 * This engine is kept as a stub for future use.
 */

interface KnownEntity {
  name: string;
  url: string;
}

// Entity linking data removed — no leader/country/alliance pages exist anymore
export const KNOWN_ENTITIES: KnownEntity[] = [];

/**
 * Replaces the first occurrence of known entities with SEO-safe internal links.
 * 
 * Rules:
 * - No overlinking (only links the FIRST occurrence of the entity in the text).
 * - Contextual linking (avoids linking inside existing HTML tags like <a> or <script>).
 */
export function autoLinkEntities(htmlContent: string): string {
  if (!htmlContent || KNOWN_ENTITIES.length === 0) return htmlContent;

  let processedHtml = htmlContent;
  
  // Sort entities by length descending to prevent partial word matches 
  // (e.g. matching "US" inside "RUSSIA")
  const sortedEntities = [...KNOWN_ENTITIES].sort((a, b) => b.name.length - a.name.length);

  sortedEntities.forEach(entity => {
    const regex = new RegExp(`\\b(${escapeRegExp(entity.name)})\\b(?![^<]*>|[^<>]*<\/a>)`, 'i');
    
    processedHtml = processedHtml.replace(regex, `<a href="${entity.url}" class="text-blue-400 hover:underline font-medium" title="Read more about $1">$1</a>`);
  });

  return processedHtml;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
