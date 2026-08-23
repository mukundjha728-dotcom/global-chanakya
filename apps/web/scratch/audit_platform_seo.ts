import mongoose from "mongoose";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const Blog = mongoose.model("Blog", new mongoose.Schema({}, { strict: false }));
  
  const totalBlogs = await Blog.countDocuments();
  const standardBlogs = await Blog.countDocuments({ contentType: { $ne: "platform-seo" } });
  const platformSeoBlogs = await Blog.countDocuments({ contentType: "platform-seo" });
  
  const publishedPlatformSeo = await Blog.countDocuments({ contentType: "platform-seo", status: "published" });
  const draftPlatformSeo = await Blog.countDocuments({ contentType: "platform-seo", status: "draft" });
  const archivedPlatformSeo = await Blog.countDocuments({ contentType: "platform-seo", status: "archived" });
  
  const platformSlugs = await Blog.aggregate([
    { $match: { contentType: "platform-seo" } },
    { $group: { _id: "$slug", count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  const platformTitles = await Blog.aggregate([
    { $match: { contentType: "platform-seo" } },
    { $group: { _id: { $toLower: "$title" }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } }
  ]);

  console.log(JSON.stringify({
    totalBlogs,
    standardBlogs,
    platformSeoBlogs,
    publishedPlatformSeo,
    draftPlatformSeo,
    archivedPlatformSeo,
    duplicateSlugs: platformSlugs,
    duplicateTitles: platformTitles
  }, null, 2));

  await mongoose.disconnect();
}
run().catch(console.error);
