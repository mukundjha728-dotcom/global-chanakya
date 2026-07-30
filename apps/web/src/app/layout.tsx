import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { Providers } from "@/components/layout/Providers";
import { CSPostHogProvider } from "@/components/providers/PostHogProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

import { SITE_URL, SITE_NAME, SITE_DESCRIPTION as SITE_DESC } from "@/constants";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `Global Chanakya: Geopolitical Intelligence & Strategic Analysis`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "geopolitics", "strategic intelligence", "foreign policy", "global affairs",
    "India geopolitics", "Global Chanakya", "Indo-Pacific",
    "defence analysis", "South Asia", "China", "Russia", "BRICS", "NATO",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: `${SITE_NAME} — Geopolitical Intelligence & Strategic Analysis`,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Geopolitical Intelligence`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESC,
    creator: "@globalchanakya",
    site: "@globalchanakya",
    images: [`${SITE_URL}/og-image.png`],
  },
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "VrGd2s0LCdRNrUkVXP2WS7oMOvKxAUD2qZE1Nsepl3A",
  },
  category: "news",
};

// JSON-LD structured data for Google rich results
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/logo.svg`,
    description: SITE_DESC,
    sameAs: [
      "https://twitter.com/globalchanakya",
      "https://linkedin.com/company/globalchanakya",
    ],
    foundingDate: "2024",
    areaServed: "Worldwide",
    knowsAbout: ["Geopolitics", "Strategic Intelligence", "Foreign Policy", "Defence"],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/blogs?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "SiteNavigationElement",
        "position": 1,
        "name": "Reports",
        "url": `${SITE_URL}/blogs`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 2,
        "name": "About Us",
        "url": `${SITE_URL}/about`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 3,
        "name": "Breaking Intel",
        "url": `${SITE_URL}/breaking`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 4,
        "name": "Methodology",
        "url": `${SITE_URL}/methodology`
      }
    ]
  }
];

import CookieConsent from "@/components/CookieConsent";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <meta name="google-site-verification" content="VrGd2s0LCdRNrUkVXP2WS7oMOvKxAUD2qZE1Nsepl3A" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />

        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3046817657353243"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <Script
          id="json-ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.variable} ${lora.variable} font-sans antialiased leading-[1.8] overflow-x-hidden w-full max-w-[100vw]`}>
        <CookieConsent />
        <CSPostHogProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <Providers>
              <ConditionalShell navbar={<Navbar />} footer={<Footer />}>
                <div className="overflow-x-hidden w-full">
                  {children}
                </div>
              </ConditionalShell>
            </Providers>
          </ThemeProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
