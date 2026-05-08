import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

// ⚠️ SECRET admin path — change this to something only YOU know
// Update ADMIN_SECRET_PATH in .env too
const ADMIN_SECRET_PATH = process.env.ADMIN_SECRET_PATH ?? '/gc-control-9x7k';

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // Block the public /admin path — redirect to 404
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.redirect(new URL('/404', req.url));
  }

  // Secret admin path — only the admin email can access
  if (pathname.startsWith(ADMIN_SECRET_PATH)) {
    if (!session) {
      // Not logged in — redirect to sign in with callbackUrl
      const url = new URL('/auth/signin', req.url);
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    const role = (session.user as any)?.role;
    if (role !== 'admin') {
      // Logged in but not admin — pretend page doesn't exist
      return NextResponse.redirect(new URL('/404', req.url));
    }
  }

  // Premium route protection
  if (pathname.startsWith('/premium')) {
    const role = (session?.user as any)?.role;
    if (!session || (role !== 'premium' && role !== 'admin')) {
      const url = new URL('/subscribe', req.url);
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Security headers on all responses
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
