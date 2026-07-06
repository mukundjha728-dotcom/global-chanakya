import { NextResponse } from 'next/server';
import { SITE_URL } from '@/constants';

export const dynamic = 'force-dynamic';

/**
 * /sitemap.xml → redirects to /sitemap-index.xml
 * This ensures Google Search Console can find the sitemap at the standard URL.
 */
export async function GET() {
  return NextResponse.redirect(`${SITE_URL}/sitemap-index.xml`, 301);
}
