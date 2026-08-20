const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI;

async function runValidation() {
  await mongoose.connect(MONGODB_URI);
  const blogSchema = new mongoose.Schema({}, { strict: false });
  const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema, 'blogs');
  const blogs = await Blog.find({}, { title: 1, slug: 1, category: 1, tags: 1 }).lean();

  const categoryMap = new Map();
  const tagMap = new Map();

  for (const blog of blogs) {
    // Categories
    if (blog.category) {
      if (!categoryMap.has(blog.category)) categoryMap.set(blog.category, { count: 0, blogs: [] });
      const entry = categoryMap.get(blog.category);
      entry.count++;
      entry.blogs.push({ id: blog._id.toString(), slug: blog.slug });
    }

    // Tags
    if (Array.isArray(blog.tags)) {
      for (const tag of blog.tags) {
        if (!tagMap.has(tag)) tagMap.set(tag, { count: 0, blogs: [] });
        const entry = tagMap.get(tag);
        entry.count++;
        entry.blogs.push({ id: blog._id.toString(), slug: blog.slug });
      }
    }
  }

  const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1].count - a[1].count);
  const sortedTags = Array.from(tagMap.entries()).sort((a, b) => b[1].count - a[1].count);

  const sampleBlogs = blogs.slice(0, 25).map(b => ({
    id: b._id.toString(),
    title: b.title,
    slug: b.slug,
    category: b.category,
    tags: b.tags
  }));

  const reportData = {
    totalBlogs: blogs.length,
    categories: sortedCategories,
    tags: sortedTags,
    sampleBlogs
  };

  fs.writeFileSync(path.resolve(__dirname, "../../scratch/validation_data.json"), JSON.stringify(reportData, null, 2));
  console.log("Validation data exported to scratch/validation_data.json");
  await mongoose.disconnect();
}

runValidation().catch(console.error);
