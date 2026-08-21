import dbConnect from "./src/lib/mongoose";
import { Blog } from "./src/lib/models/Blog";

// Force load all models just like they would be in Next.js?
// If there's a MissingSchemaError, it will happen here.
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
  } catch(e) {
    console.error("Mongoose Error:", e);
  }
  process.exit(0);
}
run();
