require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

function extractMeta(html, name) {
  const match = html.match(new RegExp("<meta[^>]*name=['\"]" + name + "['\"][^>]*content=['\"]([^'\"]*)['\"]", 'i'));
  return match ? match[1] : null;
}
function extractTitle(html) {
  const match = html.match(/<title>([^<]*)<\/title>/i);
  if (!match) return null;
  return match[1].replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
function extractCanonical(html) {
  const match = html.match(/<link[^>]*rel=['"]canonical['"][^>]*href=['"]([^'"]*)['"]/i);
  return match ? match[1] : null;
}
function extractH1(html) {
  const match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  return match ? match[1] : null;
}
function extractJsonLd(html) {
  const matches = html.matchAll(/<script[^>]*type=['"]application\/ld\+json['"][^>]*>(.*?)<\/script>/gis);
  const results = [];
  for (const match of matches) {
    try { results.push(JSON.parse(match[1])); } catch(e) {}
  }
  return results;
}

async function runRegression() {
  console.log("=== PHASE 3 SEO REGRESSION SUITE ===");
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/global-chanakya");
  
  const entitiesToTest = [
    { model: 'Category', path: 'categories', field: 'categoryId' },
    { model: 'Topic', path: 'topics', field: 'topics' },
    { model: 'Country', path: 'countries', field: 'countries' },
    { model: 'Region', path: 'regions', field: 'regions' },
    { model: 'Leader', path: 'leaders', field: 'leaders' },
    { model: 'Conflict', path: 'conflicts', field: 'conflicts' },
    { model: 'Organization', path: 'organizations', field: 'organizations' },
  ];

  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  
  let passed = 0; let failed = 0;

  async function assertPage(url, expectedStatus, validations = {}) {
    console.log("Fetching " + url + " ...");
    try {
      const res = await globalThis.fetch(url);
      if (res.status !== expectedStatus) {
        console.error("❌ " + url + " returned " + res.status + ", expected " + expectedStatus);
        failed++;
        return;
      }
      if (expectedStatus !== 200) {
        console.log("✅ " + url + " returned " + expectedStatus + " as expected.");
        passed++;
        return;
      }

      const html = await res.text();
      let ok = true;
      
      if (validations.title) {
        const title = extractTitle(html);
        if (!title || !title.includes(validations.title)) {
          console.error("❌ Title mismatch. Expected it to include '" + validations.title + "'. Got: " + title);
          ok = false;
        }
      }
      if (validations.canonical) {
        const canonical = extractCanonical(html);
        if (canonical !== validations.canonical) {
          console.error("❌ Canonical mismatch. Expected '" + validations.canonical + "'. Got: " + canonical);
          ok = false;
        }
      }
      if (validations.h1) {
        const h1 = extractH1(html);
        if (!h1 || !h1.includes(validations.h1)) {
           console.error("❌ H1 mismatch. Expected '" + validations.h1 + "'. Got: " + h1);
           ok = false;
        }
      }
      if (validations.robots) {
        const robots = extractMeta(html, 'robots');
        if (robots !== validations.robots) {
           console.error("❌ Robots mismatch. Expected '" + validations.robots + "'. Got: " + robots);
           ok = false;
        }
      }
      if (validations.checkJsonLd) {
        const jsonlds = extractJsonLd(html);
        const hasBreadcrumb = jsonlds.some(j => j['@type'] === 'BreadcrumbList' || (Array.isArray(j) && j.some(x => x['@type'] === 'BreadcrumbList')));
        if (!hasBreadcrumb) {
           console.error("❌ Missing BreadcrumbList in JSON-LD.");
           ok = false;
        }
      }

      if (ok) {
        console.log("✅ " + url + " passed all validations.");
        passed++;
      } else {
        failed++;
      }
    } catch (e) {
      console.error("❌ Error fetching " + url + ": " + e.message);
      failed++;
    }
  }

  const BASE_URL = "http://localhost:3000";

  for (const config of entitiesToTest) {
    const Model = mongoose.models[config.model] || mongoose.model(config.model, new mongoose.Schema({}, { strict: false }));
    const docs = await Model.find({}).lean();
    let indexableEntity = null;
    let thinEntity = null;
    
    for (const doc of docs) {
      const count = await Blog.countDocuments({ [config.field]: doc._id, status: 'published' });
      if (count >= 4 && !indexableEntity) indexableEntity = { ...doc, count };
      if (count === 1 && !thinEntity) thinEntity = { ...doc, count };
      if (indexableEntity && thinEntity) break;
    }

    if (indexableEntity) {
      await assertPage(BASE_URL + "/" + config.path + "/" + indexableEntity.slug, 200, {
        title: indexableEntity.name,
        h1: indexableEntity.name,
        canonical: "https://www.globalchanakya.in/" + config.path + "/" + indexableEntity.slug,
        robots: "index, follow",
        checkJsonLd: true
      });
    }

    if (thinEntity) {
      await assertPage(BASE_URL + "/" + config.path + "/" + thinEntity.slug, 200, {
        robots: "noindex, follow"
      });
    }

    await assertPage(BASE_URL + "/" + config.path + "/invalid-slug-12345", 404);
  }

  const blogs = await Blog.find({ status: 'published' }).limit(5).lean();
  for (const blog of blogs) {
    await assertPage(BASE_URL + "/blogs/" + blog.slug, 200, {
      title: (blog.seo?.title || blog.seoTitle || blog.title).substring(0, 50),
      canonical: "https://www.globalchanakya.in/blogs/" + blog.slug,
      checkJsonLd: true
    });
  }

  const categoryEntity = await mongoose.models.Category.findOne({}).lean();
  if (categoryEntity) {
    await assertPage(BASE_URL + "/blogs?category=" + encodeURIComponent(categoryEntity.name), 200, {
      canonical: "https://www.globalchanakya.in/categories/" + categoryEntity.slug
    });
  }

  await assertPage(BASE_URL + "/blogs?category=INVALID_CATEGORY_DOES_NOT_EXIST", 200, {
    canonical: "https://www.globalchanakya.in/blogs"
  });

  console.log("");
  console.log("=== RESULTS ===");
  console.log("Passed: " + passed);
  console.log("Failed: " + failed);
  
  mongoose.connection.close();
  process.exit(failed > 0 ? 1 : 0);
}

runRegression();
