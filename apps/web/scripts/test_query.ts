import dbConnect from "../src/lib/mongoose";
import { Blog } from "../src/lib/models/Blog";

async function run() {
  await dbConnect();
  
  try {
    const blog = await Blog.findOne({ slug: "india-growth-defence-geopolitics-before-after-2014" })
      .populate("author", "name authorSlug bio expertise socialLinks avatar")
      .populate("categoryId", "name slug")
      .populate("topics", "name slug")
      .populate("countries", "name slug")
      .populate("regions", "name slug")
      .populate("leaders", "name slug")
      .populate("conflicts", "name slug")
      .populate("organizations", "name slug")
      .lean();
    
    console.log("Blog retrieved:", blog ? blog.title : "Not found");
    if(blog) {
        console.log("Populated Authors:", typeof blog.author);
        console.log("Populated Regions:", Array.isArray(blog.regions) ? blog.regions.length : 0);
    }
  } catch(e) {
    console.error("Mongoose Error:", e);
    process.exit(1);
  }
  process.exit(0);
}
run();
