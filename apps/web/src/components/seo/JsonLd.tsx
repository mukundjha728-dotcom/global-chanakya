import React from "react";
import { IBlog } from "@/lib/models/Blog";

import { SITE_URL } from "@/constants";

export function JsonLd({ schema }: { schema: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export const SchemaGenerators = {
  article: (blog: IBlog) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      "@type": "Person",
      name: "Global Chanakya Analyst",
    },
    url: `${SITE_URL}/blogs/${blog.slug}`,
  }),

  faq: (questions: { question: string; answer: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  }),

  breadcrumb: (items: { name: string; url: string }[]) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }),
};
