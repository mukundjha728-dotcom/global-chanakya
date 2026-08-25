import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import { Blog } from '../src/lib/models/Blog';
import { User } from '../src/lib/models/User';
import { Category } from '../src/lib/models/Category';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB");

  // Get a dummy author and category
  const author = await User.findOne() || new mongoose.Types.ObjectId();
  const category = "Geopolitics";

  // TEST 1: Mongoose save (Create)
  console.log("\n--- TEST 1: Mongoose create (Save) ---");
  const blog1 = new Blog({
    title: "Test India—Pakistan",
    slug: "test-india-pakistan-" + Date.now(),
    excerpt: "India–Pakistan relations",
    content: "<p>Text :antCitation[]{citations='123'} more text</p>",
    category,
    author: author._id || author,
    status: "published",
    seo: {
      title: "India—Pakistan",
      description: "Text :antCitation[]{citations='123'}",
      keywords: ["India", "Pakistan"]
    }
  });

  await blog1.save();
  const saved1 = await Blog.findById(blog1._id).lean();
  console.log("Saved Title:", (saved1 as any).title); // Expect: "Test India - Pakistan"
  console.log("Saved Excerpt:", (saved1 as any).excerpt); // Expect: "India-Pakistan relations"
  console.log("Saved Content:", (saved1 as any).content); // Expect: "<p>Text more text</p>"
  console.log("Saved SEO Title:", (saved1 as any).seo.title); // Expect: "India - Pakistan"
  console.log("Saved SEO Desc:", (saved1 as any).seo.description); // Expect: "Text"

  // TEST 2: Mongoose findOneAndUpdate (Update)
  console.log("\n--- TEST 2: Mongoose findOneAndUpdate ---");
  await Blog.findOneAndUpdate(
    { _id: blog1._id },
    {
      title: "Update India—Pakistan",
      content: "Update India–Pakistan",
      "seo.description": "Update :antCitation[]{citations='123'}"
    },
    { new: true, runValidators: true } // Mongoose requires runValidators to trigger update validators
  );

  const saved2 = await Blog.findById(blog1._id).lean();
  console.log("Updated Title:", (saved2 as any).title); // Expect: "Update India - Pakistan"
  console.log("Updated Content:", (saved2 as any).content); // Expect: "Update India-Pakistan"
  console.log("Updated SEO Desc:", (saved2 as any).seo.description); // Expect: "Update"

  // Clean up
  await Blog.deleteOne({ _id: blog1._id });
  console.log("\nTests completed successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Test failed:", err.message);
  process.exit(1);
});
