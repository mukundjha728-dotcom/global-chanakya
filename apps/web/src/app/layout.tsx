import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";
import { ConditionalShell } from "@/components/layout/ConditionalShell";
import { Providers } from "@/components/layout/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const SITE_URL = "https://global-chanakya-web.vercel.app";
export const SITE_NAME = "Global Chanakya";
export const SITE_DESC =
  "India's leading geopolitical intelligence platform. In-depth analysis on foreign policy, defence strategy, and global affairs — with 24-hour premium early access.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Geopolitical Intelligence & Strategic Analysis`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "geopolitics", "strategic intelligence", "foreign policy", "global affairs",
    "premium news", "India geopolitics", "Global Chanakya", "Indo-Pacific",
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
    canonical: SITE_URL,
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
    google: "G9xLRykmNyLPv9oK0P0fg5A8cyNMl0jB10RuomUHn0w",
  },
  category: "news",
};

// JSON-LD structured data for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.svg`,
  description: SITE_DESC,
  sameAs: [
    "https://twitter.com/globalchanakya",
    "https://linkedin.com/company/globalchanakya",
  ],
  foundingDate: "2024",
  areaServed: "Worldwide",
  knowsAbout: ["Geopolitics", "Strategic Intelligence", "Foreign Policy", "Defence"],
};

import { DisableInspect } from "@/components/DisableInspect";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <Script
          id="json-ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.variable} antialiased bg-[#060606] text-white`} style={{ fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <DisableInspect />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <Providers>
              <ConditionalShell navbar={<Navbar />} footer={<Footer />}>
                {children}
              </ConditionalShell>
            </Providers>
          </ThemeProvider>
      </body>
    </html>
  );
}
