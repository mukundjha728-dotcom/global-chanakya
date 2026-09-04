"use client";
// AdSense must not initialize on admin routes — the BHK (Buy with Google) widget
// injected by adsbygoogle.js logs "[BHK] install: missing/invalid publicKey or merchantId"
// because merchant credentials are not configured for this site.
// The admin panel (/gc-control-9x7k/*) is not a monetized public page.
import Script from "next/script";
import { usePathname } from "next/navigation";

export function AdSenseScript() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/gc-control-9x7k") || pathname.startsWith("/admin");

  // Do not load AdSense on admin routes
  if (isAdmin) return null;

  return (
    <Script
      id="google-adsense"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3046817657353243"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
