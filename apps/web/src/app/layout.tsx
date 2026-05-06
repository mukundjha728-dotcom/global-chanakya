import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const SITE_URL = "https://global-chanakya-web.vercel.app";
export const SITE_NAME = "Global Chanakya";
export const SITE_DESC =
  "Premium geopolitics and strategic intelligence media platform. Get 24-hour early access to critical geopolitical reports before they go public.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Enterprise Geopolitics & Strategic Intelligence`,
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
  openGraph: {
    title: `${SITE_NAME} | Enterprise Geopolitics Media`,
    description: "Enterprise-grade geopolitical intelligence and strategic media with 24-hour premium early access.",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Global Chanakya — Geopolitics & Strategic Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "Premium geopolitics & strategic intelligence. 24-hour early access journalism.",
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
    google: "your-google-site-verification-token",
  },
  category: "news",
};

// JSON-LD structured data for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: SITE_DESC,
  sameAs: [
    "https://twitter.com/globalchanakya",
    "https://linkedin.com/company/globalchanakya",
  ],
  foundingDate: "2024",
  areaServed: "Worldwide",
  knowsAbout: ["Geopolitics", "Strategic Intelligence", "Foreign Policy", "Defence"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <Script
          id="json-ld-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Navbar />
          <div className="min-h-screen">{children}</div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
