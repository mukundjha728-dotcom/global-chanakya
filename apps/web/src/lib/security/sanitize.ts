export class Sanitizer {
  /**
   * Basic HTML tag stripper for plain text inputs
   */
  static stripHtml(text: string): string {
    if (!text) return "";
    return text.replace(/<[^>]*>?/gm, "").trim();
  }

  /**
   * Sanitizes object payloads recursively
   */
  static sanitizePayload<T>(payload: T): T {
    if (typeof payload === "string") {
      return this.stripHtml(payload) as unknown as T;
    }
    
    if (Array.isArray(payload)) {
      return payload.map(item => this.sanitizePayload(item)) as unknown as T;
    }
    
    if (payload !== null && typeof payload === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(payload)) {
        sanitized[key] = this.sanitizePayload(value);
      }
      return sanitized as unknown as T;
    }
    
    return payload;
  }
}
