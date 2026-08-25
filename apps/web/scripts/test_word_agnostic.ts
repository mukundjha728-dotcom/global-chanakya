import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import { Blog } from '../src/lib/models/Blog';
import { User } from '../src/lib/models/User';
import { sanitizeBlogContent } from '../src/lib/utils/contentSanitizer';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("Connected to MongoDB\n");

  const author = await User.findOne() || new mongoose.Types.ObjectId();
  const category = "Geopolitics";

  // Test matrix for word-agnostic sanitizer
  const testCases = [
    "India—Pakistan",
    "Russia—Ukraine",
    "China—Taiwan",
    "Trump—Putin",
    "Economy—Trade",
    "Technology—Security",
    "Asia—Europe",
    "Climate—Energy",
    "ABC—XYZ",
    "Foo—Bar",
    "A—B—C",
    "word—word",
    "name—name",
    "123—456",
    "Technology—AI",
    "Geopolitics—Economics",
    "Long sentence with multiple—symbols—inside"
  ];

  console.log("=== RAW SANITIZER TEST MATRIX ===");
  for (const tc of testCases) {
    const sanitized = sanitizeBlogContent(tc, "text");
    console.log(`"${tc}" -> "${sanitized}"`);
  }
  console.log("\n");

  // Test full integration with Mongoose (save & findOneAndUpdate)
  console.log("=== MONGOOSE SAVE INTEGRATION TEST ===");
  const blogId = new mongoose.Types.ObjectId();
  const blog = new Blog({
    _id: blogId,
    title: "ABC—XYZ",
    slug: "test-abc-xyz-" + Date.now(),
    excerpt: "123—456 and more—dashes",
    content: "<p>Technology—AI with multiple—symbols—inside</p>",
    category,
    author: author._id || author,
    status: "published",
    seo: {
      title: "Foo—Bar",
      description: "Russia—Ukraine and China—Taiwan",
      keywords: ["Testing"]
    }
  });

  await blog.save();
  const savedBlog = await Blog.findById(blogId).lean();

  console.log("Saved Title:", (savedBlog as any).title);
  console.log("Saved Excerpt:", (savedBlog as any).excerpt);
  console.log("Saved Content:", (savedBlog as any).content);
  console.log("Saved SEO Title:", (savedBlog as any).seo.title);
  console.log("Saved SEO Desc:", (savedBlog as any).seo.description);
  
  console.log("\n=== MONGOOSE FINDONEANDUPDATE TEST ===");
  await Blog.findOneAndUpdate(
    { _id: blogId },
    {
      title: "A—B—C",
      content: "Long sentence with multiple—symbols—inside—and—more",
      "seo.description": "name—name"
    },
    { new: true, runValidators: true }
  );

  const updatedBlog = await Blog.findById(blogId).lean();
  console.log("Updated Title:", (updatedBlog as any).title);
  console.log("Updated Content:", (updatedBlog as any).content);
  console.log("Updated SEO Desc:", (updatedBlog as any).seo.description);

  await Blog.deleteOne({ _id: blogId });
  console.log("\nTests completed successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Test failed:", err.message);
  process.exit(1);
});
