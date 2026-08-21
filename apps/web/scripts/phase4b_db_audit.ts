import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import "./src/lib/mongoose";

async function runAudit() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const Blog = mongoose.models.Blog;
  
  const allBlogs = await Blog.find({}).select("slug status title categoryId topics countries regions leaders conflicts organizations").lean();
  
  const published = allBlogs.filter(b => b.status === 'published');
  const archived = allBlogs.filter(b => b.status === 'archived');
  
  // Taxonomy Check
  const taxonomies = ["Category", "Topic", "Country", "Region", "Leader", "Conflict", "Organization"];
  const taxResults = {};
  for (const tax of taxonomies) {
    const model = mongoose.models[tax];
    const items = await model.find({}).lean();
    const thin = items.filter(i => (i.articleCount || 0) < 4);
    taxResults[tax] = {
      total: items.length,
      thin: thin.length,
      thinSample: thin.slice(0, 3).map(t => t.slug)
    };
  }
  
  // Explain
  const explainTopic = await Blog.find({ topics: "6a869eca84b2ccb78887bc3f", status: "published" }).explain("executionStats");
  
  console.log(JSON.stringify({
    total: allBlogs.length,
    published: published.length,
    archived: archived.length,
    taxonomies: taxResults,
    explain: {
      topicStage: explainTopic.queryPlanner?.winningPlan?.stage || explainTopic.queryPlanner?.winningPlan?.inputStage?.stage,
      executionTimeMillis: explainTopic.executionStats?.executionTimeMillis
    }
  }, null, 2));
  
  process.exit(0);
}
runAudit().catch(console.error);
