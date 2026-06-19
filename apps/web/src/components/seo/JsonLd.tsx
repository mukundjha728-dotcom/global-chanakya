import React from "react";
import { ICountry } from "@/lib/models/Country";
import { ILeader } from "@/lib/models/Leader";
import { IConflict } from "@/lib/models/Conflict";
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
  country: (country: ICountry) => ({
    "@context": "https://schema.org",
    "@type": ["Place", "GovernmentOrganization"],
    name: country.name,
    description: country.overview,
    url: `${SITE_URL}/country/${country.slug}`,
    image: country.flagUrl,
  }),
  
  leader: (leader: ILeader, countryName?: string) => ({
    "@context": "https://schema.org",
    "@type": "Person",
    name: leader.name,
    jobTitle: leader.title,
    description: leader.bio,
    url: `${SITE_URL}/leader/${leader.slug}`,
    image: leader.imageUrl,
    ...(countryName && { nationality: { "@type": "Country", name: countryName } }),
  }),

  conflict: (conflict: IConflict) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    name: conflict.title,
    description: conflict.overview,
    startDate: conflict.startDate,
    endDate: conflict.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    url: `${SITE_URL}/conflict/${conflict.slug}`,
  }),

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
