import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://global-chanakya-web.vercel.app";

const blogSchema = new mongoose.Schema({
  slug: String,
  status: String,
}, { collection: 'blogs' });

const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema);

async function main() {
  try {
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI is not defined in .env.local');
    }
    await mongoose.connect(MONGODB_URI);
    const blogs = await Blog.find({ status: 'published' }).select('slug').lean();
    const urls = blogs.map(b => `${SITE_URL}/blogs/${b.slug}`);
    fs.writeFileSync('published_blog_urls.txt', urls.join('\n'));
    console.log(`Extracted ${urls.length} URLs to published_blog_urls.txt`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    mongoose.disconnect();
  }
}

main();
