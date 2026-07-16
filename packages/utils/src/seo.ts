type Metadata = any;

export interface SeoOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string;
  imageUrl?: string;
  type?: "website" | "article" | "profile";
  authorName?: string;
  publishedTime?: string;
  modifiedTime?: string;
  robots?: string;        // e.g. "index,follow" or "noindex,nofollow"
  siteName?: string;
  locale?: string;
  category?: string;
  twitterHandle?: string;
}

export function generateSeoMetadata({
  title,
  description,
  canonicalUrl,
  keywords,
  imageUrl,
  type = "website",
  authorName,
  publishedTime,
  modifiedTime,
  robots,
  siteName = "Global Chanakya",
  locale = "en_US",
  category,
  twitterHandle = "@globalchanakya",
}: SeoOptions): Metadata {
  const openGraph: any = {
    title,
    description,
    url: canonicalUrl,
    type,
    siteName,
    locale,
    ...(imageUrl ? { images: [{ url: imageUrl, width: 1200, height: 630, alt: title }] } : {}),
  };

  if (type === "article") {
    if (publishedTime) openGraph.publishedTime = publishedTime;
    if (modifiedTime) openGraph.modifiedTime = modifiedTime;
    if (authorName) openGraph.authors = [authorName];
  }

  const metadata: any = {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: twitterHandle,
      site: twitterHandle,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };

  // Robots directive
  if (robots) {
    const parts = robots.split(",").map((p: string) => p.trim().toLowerCase());
    metadata.robots = {
      index: !parts.includes("noindex"),
      follow: !parts.includes("nofollow"),
    };
  }

  // Category
  if (category) {
    metadata.category = category;
  }

  return metadata;
}
