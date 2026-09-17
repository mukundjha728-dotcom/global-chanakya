import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const Blog = mongoose.connection.collection("blogs");
  const slugs = [
    "geopolitical-early-warning-systems-signals-strategic-intelligence", 
    "leader-intelligence-ai-tracks-global-political-decision-makers", 
    "country-intelligence-ai-global-geopolitical-risks",
    "conflict-intelligence-ai-track-global-conflicts"
  ];
  const res = await Blog.find({ slug: { $in: slugs } }).toArray();
  console.log(res.map(r => ({ 
    slug: r.slug, 
    status: r.status,
    contentType: r.contentType,
    category: r.category
  })));
  process.exit(0);
});
