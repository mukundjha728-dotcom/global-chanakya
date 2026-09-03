/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityService } from "@/modules/seo/services/entity.service";
import { EntityHub } from "@/components/seo/EntityHub";
import { generateSeoMetadata } from "@repo/utils";
import { SITE_URL } from "@/constants";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const data = await EntityService.getEntityData("Conflict", decodedSlug, "conflicts");
  if (!data || data.status === "404") return { title: "Not Found" };

  const { entity } = data;
  
  // Enforce length limits (Title: 50-65, Desc: 140-165)
  let title = entity.seo?.title || `${entity.name} Geopolitics & Strategic Intelligence | Global Chanakya`;
  if (title.length > 65) title = title.substring(0, 62) + "...";
  
  let description = entity.seo?.description || entity.description || `In-depth geopolitical intelligence, strategic analysis, and the latest reports regarding ${entity.name}.`;
  if (description.length > 165) description = description.substring(0, 162) + "...";

  return generateSeoMetadata({
    title,
    description,
    canonicalUrl: `${SITE_URL}/conflicts/${decodedSlug}`,
    type: "website",
    robots: data.indexable ? "index, follow" : "noindex, follow",
    imageUrl: entity.featuredImage,
  });
}

export default async function ConflictHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const data = await EntityService.getEntityData("Conflict", decodedSlug, "conflicts");
  if (!data || data.status === "404") {
    notFound();
  }

  const articles = await EntityService.getEntityArticles("conflicts", data.entity._id);
  const relatedEntities = await EntityService.getContextualRelatedEntities("conflicts", data.entity._id);

  // Determine structured data
  const typeStr = "Conflict" as string;
  const isProfile = ["Leader", "Organization"].includes(typeStr);
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": isProfile ? "ProfilePage" : "CollectionPage",
    name: data.entity.name,
    description: data.entity.description || `Intelligence hub for ${data.entity.name}`,
    url: `${SITE_URL}/conflicts/${decodedSlug}`,
    mainEntity: isProfile ? {
      "@type": typeStr === "Leader" ? "Person" : "Organization",
      name: data.entity.name,
      description: data.entity.description,
      ...(data.entity.featuredImage ? { image: data.entity.featuredImage } : {})
    } : {
      "@type": "ItemList",
      itemListElement: articles.map((a: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/blogs/${a.slug || a._id}`
      }))
    }
  };

  return (
    <EntityHub 
      entityType="Conflict"
      slug={decodedSlug}
      name={data.entity.name}
      description={data.entity.description}
      articleCount={data.articleCount}
      status={data.status}
      articles={articles}
      relatedEntities={relatedEntities}
      structuredData={structuredData}
    />
  );
}
