import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

// Allowed roles for the /admin dashboard area
const ADMIN_ROLES = ["super_admin", "admin", "editor", "analyst"];

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

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



  // 3. Security Headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: http:; font-src 'self' data:; connect-src 'self' https:;"
  );

  return response;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
