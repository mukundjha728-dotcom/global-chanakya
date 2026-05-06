import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // RBAC & Route Protection
  if (pathname.startsWith('/admin')) {
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  if (pathname.startsWith('/premium')) {
    if (!session || ((session.user as any)?.role !== 'premium' && (session.user as any)?.role !== 'admin')) {
      return NextResponse.redirect(new URL('/subscribe', req.url));
    }
  }

  // Basic Security Headers (Helmet equivalent for Edge)
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
