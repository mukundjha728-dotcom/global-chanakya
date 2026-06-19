import { Metadata } from "next";

export interface SeoOptions {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords?: string;
  imageUrl?: string;
  type?: "website" | "article" | "profile";
}

export function generateSeoMetadata({
  title,
  description,
  canonicalUrl,
  keywords,
  imageUrl,
  type = "website"
}: SeoOptions): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type,
      ...(imageUrl ? { images: [{ url: imageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    }
  };
}
