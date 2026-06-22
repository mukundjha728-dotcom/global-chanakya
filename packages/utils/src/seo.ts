import { Metadata } from "next";

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
  modifiedTime
}: SeoOptions): Metadata {
  const openGraph: any = {
    title,
    description,
    url: canonicalUrl,
    type,
    ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
  };

  if (type === "article") {
    if (publishedTime) openGraph.publishedTime = publishedTime;
    if (modifiedTime) openGraph.modifiedTime = modifiedTime;
    if (authorName) openGraph.authors = [authorName];
  }

  return {
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
      ...(imageUrl ? { images: [imageUrl] } : {}),
    }
  };
}
