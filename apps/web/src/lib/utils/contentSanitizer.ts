export function sanitizeInternalCitations(content: string | undefined | null): string {
  if (!content) return content || "";

  // Target the structural signature of the internal citation artifact:
  // e.g. :antCitation[]{citations="b5d81999-49df-4ef6-9f53-817adf6076bf" injected="space"}
  // We match :antCitation followed by [] and {} containing attributes.
  // We cautiously remove any leading space if the tag itself dictates a space removal, 
  // but to be extremely safe and prevent words from concatenating incorrectly, 
  // we will just replace the match with nothing. If it leaves double spaces, we can optionally clean them,
  // but the prompt said "Only repair whitespace immediately affected by artifact removal when necessary".
  // Actually, removing `:antCitation[]{...}` is usually enough. If there's a space before it, and a space after, it leaves double space.
  // A double space in HTML/Markdown is usually rendered as a single space anyway.
  // We'll use a regex that safely targets exactly the artifact format.
  
  // The regex looks for :antCitation, then optional whitespace, then \[\], then optional whitespace, then \{.*?\}
  const artifactRegex = /:antCitation\s*\[.*?\]\s*\{.*?\}/gs;
  
  // Replace the artifact
  let sanitized = content.replace(artifactRegex, "");

  return sanitized;
}
