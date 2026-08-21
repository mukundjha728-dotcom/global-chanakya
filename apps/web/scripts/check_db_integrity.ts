import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import "./src/lib/mongoose";

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const total = await mongoose.models.Blog.countDocuments();
  const published = await mongoose.models.Blog.countDocuments({ status: "published" });
  const archived = await mongoose.models.Blog.countDocuments({ status: "archived" });
  console.log(`Blogs = ${total}`);
  console.log(`Published = ${published}`);
  console.log(`Archived = ${archived}`);
  process.exit(0);
}
checkDb();
