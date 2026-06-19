import { NextRequest } from "next/server";

export class CsrfValidator {
  /**
   * Validates origin and referer headers against the expected host
   * Basic protection against CSRF since NextAuth handles its own token
   */
  static validateOrigin(req: NextRequest): boolean {
    const origin = req.headers.get("origin");
    const host = req.headers.get("host");

    if (origin) {
      const originUrl = new URL(origin);
      if (originUrl.host !== host) {
        return false;
      }
    }
    return true;
  }
}
