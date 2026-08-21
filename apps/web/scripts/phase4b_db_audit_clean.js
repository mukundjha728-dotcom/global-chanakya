const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const BlogSchema = new mongoose.Schema({}, { strict: false, collection: 'blogs' });
const Blog = mongoose.models.Blog || mongoose.model("Blog", BlogSchema);

const CategorySchema = new mongoose.Schema({}, { strict: false, collection: 'categories' });
const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const TopicSchema = new mongoose.Schema({}, { strict: false, collection: 'topics' });
const Topic = mongoose.models.Topic || mongoose.model("Topic", TopicSchema);
const CountrySchema = new mongoose.Schema({}, { strict: false, collection: 'countries' });
const Country = mongoose.models.Country || mongoose.model("Country", CountrySchema);
const RegionSchema = new mongoose.Schema({}, { strict: false, collection: 'regions' });
const Region = mongoose.models.Region || mongoose.model("Region", RegionSchema);
const LeaderSchema = new mongoose.Schema({}, { strict: false, collection: 'leaders' });
const Leader = mongoose.models.Leader || mongoose.model("Leader", LeaderSchema);
const ConflictSchema = new mongoose.Schema({}, { strict: false, collection: 'conflicts' });
const Conflict = mongoose.models.Conflict || mongoose.model("Conflict", ConflictSchema);
const OrganizationSchema = new mongoose.Schema({}, { strict: false, collection: 'organizations' });
const Organization = mongoose.models.Organization || mongoose.model("Organization", OrganizationSchema);

async function runAudit() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const allBlogs = await Blog.find({}).select("slug status title categoryId topics countries regions leaders conflicts organizations").lean();
  const published = allBlogs.filter(b => b.status === 'published');
  const archived = allBlogs.filter(b => b.status === 'archived');
  
  const models = { Category, Topic, Country, Region, Leader, Conflict, Organization };
  const taxResults = {};
  for (const [name, model] of Object.entries(models)) {
    const items = await model.find({}).lean();
    const thin = items.filter(i => (i.articleCount || 0) < 4);
    taxResults[name] = {
      total: items.length,
      thin: thin.length,
      thinSample: thin.slice(0, 3).map(t => t.slug)
    };
  }
  
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
