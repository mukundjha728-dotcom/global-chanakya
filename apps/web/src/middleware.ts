import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { ratelimit } from '@/lib/rate-limit';

const { auth } = NextAuth(authConfig);

// Allowed roles for the /admin dashboard area
const ADMIN_ROLES = ["super_admin", "admin", "editor", "analyst"];

export default auth(async (req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // 0. API Rate Limiting & CSRF
  if (pathname.startsWith('/api/')) {
    // CSRF Check for mutating requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const origin = req.headers.get('origin');
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin || 'http://localhost:3000';
      if (origin && !origin.startsWith(siteUrl)) {
        return new NextResponse('Forbidden - CSRF origin mismatch', { status: 403 });
      }
    }

    // Rate Limiting
    if (ratelimit) {
      const ip = req.ip ?? req.headers.get('x-forwarded-for') ?? '127.0.0.1';
      const { success, pending, limit, reset, remaining } = await ratelimit.limit(ip);
      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        });
      }
    }
  }

  // 1. Admin Route Protection
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!session?.user) {
      const url = new URL('/api/auth/signin', req.url);
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    const role = session.user.role;
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL('/404', req.url));
    }
  }

  // 2. Session Fingerprinting
  const response = NextResponse.next();
  if (!req.cookies.has('gc_fingerprint')) {
    const fingerprint = crypto.randomUUID();
    response.cookies.set('gc_fingerprint', fingerprint, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  // 3. Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http: blob:; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https:;"
  );

  return response;
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap\\.xml|robots\\.txt).*)'],
};
