const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/blogs/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace static metadata with dynamic generateMetadata
const staticMetadata = `export const metadata = {
  title: "Latest Intel",
  description: "Read the latest geopolitical reports and intelligence briefs.",
  alternates: {
    canonical: "/blogs",
  },
};`;

const dynamicMetadata = `import { Metadata } from "next";
import { Category } from "@/lib/models/Category";
import { SITE_URL } from "@/constants";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const categoryRaw = resolvedParams.category as string | undefined;

  let canonicalUrl = \`\${SITE_URL}/blogs\`;
  let title = "Latest Intel";
  
  if (categoryRaw) {
    await dbConnect();
    // Resolve raw category parameter to normalized entity canonical slug
    const categoryEntity = await Category.findOne({ name: categoryRaw }).lean();
    if (categoryEntity) {
      canonicalUrl = \`\${SITE_URL}/categories/\${categoryEntity.slug}\`;
      title = \`\${categoryEntity.name} Intelligence Reports\`;
    }
  }

  return {
    title,
    description: "Read the latest geopolitical reports and intelligence briefs.",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}
`;

content = content.replace(staticMetadata, dynamicMetadata);

fs.writeFileSync(filePath, content);
console.log("Updated blogs/page.tsx with dynamic canonical metadata.");
