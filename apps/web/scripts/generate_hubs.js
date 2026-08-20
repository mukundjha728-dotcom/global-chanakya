const fs = require('fs');
const path = require('path');

const HUBS = [
  { path: 'categories', modelName: 'Category', field: 'categoryId' },
  { path: 'topics', modelName: 'Topic', field: 'topics' },
  { path: 'countries', modelName: 'Country', field: 'countries' },
  { path: 'regions', modelName: 'Region', field: 'regions' },
  { path: 'leaders', modelName: 'Leader', field: 'leaders' },
  { path: 'conflicts', modelName: 'Conflict', field: 'conflicts' },
  { path: 'organizations', modelName: 'Organization', field: 'organizations' }
];

HUBS.forEach(hub => {
  const dirPath = path.resolve(__dirname, `../src/app/${hub.path}/[slug]`);
  fs.mkdirSync(dirPath, { recursive: true });

  const pageContent = `import { Metadata } from "next";
import { notFound } from "next/navigation";
import { EntityService } from "@/modules/seo/services/entity.service";
import { EntityHub } from "@/components/seo/EntityHub";
import { generateSeoMetadata } from "@repo/utils";
import { SITE_URL } from "@/constants";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const data = await EntityService.getEntityData("${hub.modelName}", decodedSlug, "${hub.field}");
  if (!data || data.status === "404") return { title: "Not Found" };

  const { entity } = data;
  
  // Enforce length limits (Title: 50-65, Desc: 140-165)
  let title = entity.seo?.title || \`\${entity.name} Geopolitics & Strategic Intelligence | Global Chanakya\`;
  if (title.length > 65) title = title.substring(0, 62) + "...";
  
  let description = entity.seo?.description || entity.description || \`In-depth geopolitical intelligence, strategic analysis, and the latest reports regarding \${entity.name}.\`;
  if (description.length > 165) description = description.substring(0, 162) + "...";

  return generateSeoMetadata({
    title,
    description,
    canonicalUrl: \`\${SITE_URL}/${hub.path}/\${decodedSlug}\`,
    type: "website",
    robots: data.indexable ? "index, follow" : "noindex, follow",
    imageUrl: entity.featuredImage,
  });
}

export default async function ${hub.modelName}HubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const data = await EntityService.getEntityData("${hub.modelName}", decodedSlug, "${hub.field}");
  if (!data || data.status === "404") {
    notFound();
  }

  const articles = await EntityService.getEntityArticles("${hub.field}", data.entity._id);
  const relatedEntities = await EntityService.getContextualRelatedEntities("${hub.field}", data.entity._id);

  // Determine structured data
  const isProfile = ["Leader", "Organization"].includes("${hub.modelName}");
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": isProfile ? "ProfilePage" : "CollectionPage",
    name: data.entity.name,
    description: data.entity.description || \`Intelligence hub for \${data.entity.name}\`,
    url: \`\${SITE_URL}/${hub.path}/\${decodedSlug}\`,
    mainEntity: isProfile ? {
      "@type": "${hub.modelName}" === "Leader" ? "Person" : "Organization",
      name: data.entity.name,
      description: data.entity.description,
      ...(data.entity.featuredImage ? { image: data.entity.featuredImage } : {})
    } : {
      "@type": "ItemList",
      itemListElement: articles.map((a: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: \`\${SITE_URL}/blogs/\${a.slug || a._id}\`
      }))
    }
  };

  return (
    <EntityHub 
      entityType="${hub.modelName}"
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
`;

  fs.writeFileSync(path.join(dirPath, 'page.tsx'), pageContent);
});

console.log("Hub pages generated successfully.");
