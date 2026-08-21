const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });
require("./src/lib/mongoose.ts"); // Initialize mongoose schemas
const Blog = mongoose.models.Blog;

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const total = await Blog.countDocuments();
  const published = await Blog.countDocuments({ status: "published" });
  const archived = await Blog.countDocuments({ status: "archived" });
  console.log(`Blogs = ${total}`);
  console.log(`Published = ${published}`);
  console.log(`Archived = ${archived}`);
  process.exit(0);
}
checkDb();
