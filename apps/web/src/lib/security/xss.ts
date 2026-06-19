export class XssDetector {
  /**
   * Deep payload inspection for common XSS vectors
   */
  static hasXssVectors(payload: string): boolean {
    if (!payload) return false;
    
    const xssPatterns = [
      /<script\b[^>]*>([\s\S]*?)<\/script>/gi, // <script> tags
      /javascript:/gi, // javascript: URIs
      /on\w+\s*=/gi, // Event handlers (onclick, onerror, etc.)
      /eval\((.*)\)/gi, // eval()
      /setTimeout\((.*)\)/gi, // setTimeout()
      /setInterval\((.*)\)/gi, // setInterval()
    ];

    return xssPatterns.some(pattern => pattern.test(payload));
  }

  static validatePayload(payload: string) {
    if (this.hasXssVectors(payload)) {
      throw new Error("Malicious payload detected (XSS)");
    }
  }
}
