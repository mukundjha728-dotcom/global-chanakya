import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitizes an HTML string to prevent XSS attacks.
 * @param html The raw HTML string
 * @returns Safe HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "code", "pre", "br", "hr", "img", "span", "div"
    ],
    ALLOWED_ATTR: ["href", "title", "alt", "src", "class", "id", "style"],
  });
}
