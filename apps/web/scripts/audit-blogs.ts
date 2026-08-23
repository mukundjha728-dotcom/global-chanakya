import { config } from "dotenv";
config({ path: ".env.local" });
import dbConnect from "../src/lib/mongoose";
import { Blog } from "../src/lib/models/Blog";

async function runAudit() {
  await dbConnect();
  
  const blogs = await Blog.find({ status: "published" });
  
  console.log(`\n========== BLOG AUDIT ==========`);
  console.log(`Total Published Blogs: ${blogs.length}`);
  
  let totalChars = 0;
  let totalWords = 0;
  let minWords = Infinity;
  let maxWords = 0;
  let minBlog = "";
  let maxBlog = "";

  for (const blog of blogs) {
    const textContent = blog.content ? blog.content.replace(/<[^>]+>/g, ' ') : '';
    const charCount = textContent.length;
    const wordCount = textContent.split(/\s+/).filter((w: string) => w.length > 0).length;
    
    totalChars += charCount;
    totalWords += wordCount;
    
    if (wordCount < minWords && wordCount > 0) {
      minWords = wordCount;
      minBlog = blog.slug;
    }
    
    if (wordCount > maxWords) {
      maxWords = wordCount;
      maxBlog = blog.slug;
    }
  }

  const avgWords = Math.round(totalWords / blogs.length);
  const avgChars = Math.round(totalChars / blogs.length);

  console.log(`Average Word Count: ${avgWords}`);
  console.log(`Average Character Count: ${avgChars}`);
  console.log(`Longest Article: ${maxWords} words (${maxBlog})`);
  console.log(`Shortest Useful Article: ${minWords} words (${minBlog})`);
  
  process.exit(0);
}

runAudit().catch(console.error);
