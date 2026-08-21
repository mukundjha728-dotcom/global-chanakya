import { generateBlogJsonLd } from "../src/lib/seo/generateBlogJsonLd";

function runTests() {
  console.log("Running Schema Unit Tests...");

  const baseBlog = {
    title: "Trump's \"Economic D-Day\" & Global Strategy",
    slug: "schema-test-economic-day",
    category: "Geopolitics",
    tags: ["Trump", "United States", "Global Strategy"],
    featuredImage: "https://example.com/image.jpg",
    publishAt: new Date("2026-08-21T10:00:00Z").toISOString(),
    updatedAt: new Date("2026-08-21T12:00:00Z").toISOString(),
    excerpt: "A strategic analysis of Trump's evolving economic and geopolitical policy.",
    content: "<p>A realistic temporary article.</p>",
    seo: {
      title: "Trump's Economic D-Day Strategy",
      description: "A strategic analysis of Trump's evolving economic and geopolitical policy.",
      canonicalUrl: "https://www.globalchanakya.in/blogs/schema-test-economic-day",
      keywords: ["Trump", "Economy"]
    }
  };

  function testParse(schema) {
    const stringified = JSON.stringify(schema);
    JSON.parse(stringified); // throws if invalid
    return stringified;
  }

  // 1. Full article
  let schema = generateBlogJsonLd(baseBlog);
  testParse(schema);
  console.log("✓ Full article valid");

  // 2. No image
  const noImageBlog = { ...baseBlog, featuredImage: null };
  schema = generateBlogJsonLd(noImageBlog);
  testParse(schema);
  console.log("✓ No image valid (uses fallback)");

  // 3. No SEO description (should fallback to excerpt)
  const noSeoDescBlog = { ...baseBlog, seo: { ...baseBlog.seo, description: null } };
  schema = generateBlogJsonLd(noSeoDescBlog);
  const parsed3 = JSON.parse(testParse(schema));
  if (parsed3[0].description !== baseBlog.excerpt) throw new Error("Fallback failed");
  console.log("✓ No SEO description valid (fallback to excerpt)");

  // 4. No updatedAt
  const noUpdateBlog = { ...baseBlog, updatedAt: null };
  schema = generateBlogJsonLd(noUpdateBlog);
  const parsed4 = JSON.parse(testParse(schema));
  if (parsed4[0].dateModified !== baseBlog.publishAt) throw new Error("Fallback failed");
  console.log("✓ No updatedAt valid (fallback to publishAt)");

  // 5. Special characters, Unicode, Apostrophes, Quotes, Ampersands, HTML characters
  const specialBlog = { ...baseBlog, title: "India–China Relations: नई रणनीतिक दिशा & \"Quotes\" 'Apostrophes' <tags>" };
  schema = generateBlogJsonLd(specialBlog);
  testParse(schema);
  console.log("✓ Special characters valid");

  // 6. Very long title
  const longTitleBlog = { ...baseBlog, title: "A".repeat(500) };
  schema = generateBlogJsonLd(longTitleBlog);
  testParse(schema);
  console.log("✓ Very long title valid");

  // 7. Article with FAQ blocks
  const faqBlog = { ...baseBlog, faq: [{ question: "What is this?", answer: "This is a test." }] };
  schema = generateBlogJsonLd(faqBlog);
  const parsed7 = JSON.parse(testParse(schema));
  if (!parsed7.find(g => g["@type"] === "FAQPage")) throw new Error("FAQ schema missing");
  console.log("✓ Article with FAQ blocks valid");

  // 8. Article without FAQ blocks
  const noFaqBlog = { ...baseBlog, faq: [] };
  schema = generateBlogJsonLd(noFaqBlog);
  const parsed8 = JSON.parse(testParse(schema));
  if (parsed8.find(g => g["@type"] === "FAQPage")) throw new Error("FAQ schema hallucinated");
  console.log("✓ Article without FAQ blocks valid");

  console.log("All unit tests passed.");
}

runTests();
