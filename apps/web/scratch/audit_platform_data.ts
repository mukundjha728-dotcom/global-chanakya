import mongoose from "mongoose";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const Blog = mongoose.model("Blog", new mongoose.Schema({}, { strict: false }));
  const Country = mongoose.model("Country", new mongoose.Schema({}, { strict: false }));
  const Leader = mongoose.model("Leader", new mongoose.Schema({}, { strict: false }));
  const Conflict = mongoose.model("Conflict", new mongoose.Schema({}, { strict: false }));
  const IntelligenceEvent = mongoose.model("IntelligenceEvent", new mongoose.Schema({}, { strict: false }));

  const data = {
    blogs: await Blog.countDocuments(),
    standardBlogs: await Blog.countDocuments({ contentType: { $ne: "platform-seo" } }),
    platformSeoBlogs: await Blog.countDocuments({ contentType: "platform-seo" }),
    publishedPlatformSeo: await Blog.countDocuments({ contentType: "platform-seo", status: "published" }),
    countries: await Country.countDocuments(),
    leaders: await Leader.countDocuments(),
    conflicts: await Conflict.countDocuments(),
    intelligenceEvents: await IntelligenceEvent.countDocuments(),
    publishedIntelligence: await IntelligenceEvent.countDocuments({ status: "published" }),
    draftIntelligence: await IntelligenceEvent.countDocuments({ status: "draft" }),
    failedEnrichment: await IntelligenceEvent.countDocuments({ enrichmentStatus: "FAILED" }),
    completedEnrichment: await IntelligenceEvent.countDocuments({ enrichmentStatus: "COMPLETED" }),
  };

  console.log(JSON.stringify(data, null, 2));
  await mongoose.disconnect();
}
run().catch(console.error);
