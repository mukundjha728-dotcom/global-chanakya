import { SITE_URL } from "@/constants";

export function sanitizeOgImageUrl(url: string | undefined | null): string {
  const fallback = `${SITE_URL}/default-og.jpg`;
  if (!url) return fallback;
  // Block Google encrypted TBN hotlinks — they expire and block crawlers
  if (url.includes('encrypted-tbn0.gstatic.com') || url.includes('gstatic.com/images')) {
    return fallback;
  }
  return url;
}

export function generateBlogJsonLd(blog: any) {
  const authorData = (blog.author && blog.author.name && blog.author.name !== "Global Chanakya Editorial")
    ? {
        "@type": "Person",
        name: blog.author.name,
        ...(blog.author.avatar && { image: blog.author.avatar }),
        ...(blog.author.bio && { description: blog.author.bio }),
        ...(blog.author.socialLinks && Object.keys(blog.author.socialLinks).length > 0 && { 
          sameAs: Object.values(blog.author.socialLinks).filter((v: any) => v) 
        })
      }
    : {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Global Chanakya"
      };

  const jsonLd: any[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.seo?.title || blog.title,
      description: blog.seo?.description || blog.excerpt,
      image: blog.featuredImage ? [sanitizeOgImageUrl(blog.featuredImage)] : [sanitizeOgImageUrl(null)],
      datePublished: blog.publishAt ? new Date(blog.publishAt).toISOString() : undefined,
      dateModified: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : (blog.publishAt ? new Date(blog.publishAt).toISOString() : undefined),
      author: authorData,
      publisher: {
        "@type": "Organization",
        name: "Global Chanakya Intelligence",
        "@id": `${SITE_URL}/#organization`
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": blog.seo?.canonicalUrl || `${SITE_URL}/blogs/${blog.slug}`,
      },
      keywords: blog.tags?.join(", ") || (blog.seo?.keywords && Array.isArray(blog.seo.keywords) ? blog.seo.keywords.join(", ") : ""),
      articleSection: blog.category,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${SITE_URL}`
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blogs",
          item: `${SITE_URL}/blogs`
        },
        {
          "@type": "ListItem",
          position: 3,
          name: blog.seo?.title || blog.title,
          item: blog.seo?.canonicalUrl || `${SITE_URL}/blogs/${blog.slug}`
        }
      ]
    }
  ];

  if (blog.faq && Array.isArray(blog.faq) && blog.faq.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: blog.faq.map((q: any) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer
        }
      }))
    });
  }

  return jsonLd;
}
