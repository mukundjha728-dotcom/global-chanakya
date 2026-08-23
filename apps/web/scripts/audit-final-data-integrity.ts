import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import mongoose from 'mongoose';
import dbConnect from '../src/lib/mongoose';
import { IntelligenceEvent } from '../src/lib/models/IntelligenceEvent';
import { BlogChunk } from '../src/lib/models/BlogChunk';
import { Blog } from '../src/lib/models/Blog';

async function finalAudit() {
  await dbConnect();
  
  console.log("=== FINAL DATA INTEGRITY AUDIT ===\n");
  
  const totalEvents = await IntelligenceEvent.countDocuments();
  const activeEvents = await IntelligenceEvent.countDocuments({ status: "published" });
  const archivedEvents = await IntelligenceEvent.countDocuments({ status: "archived" });
  const malformedEmbeddings = await IntelligenceEvent.countDocuments({ 
    $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }] 
  });
  
  const distinctHashes = (await IntelligenceEvent.distinct('contentHash')).length;
  const duplicateContentHash = totalEvents - distinctHashes;
  
  const distinctSlugs = (await IntelligenceEvent.distinct('slug')).length;
  const duplicateSlug = totalEvents - distinctSlugs;
  
  const missingMetadata = await IntelligenceEvent.countDocuments({
    $or: [{ title: "" }, { summary: "" }, { content: "" }]
  });

  const withCountries = await IntelligenceEvent.countDocuments({ countries: { $exists: true, $not: { $size: 0 } } });
  
  console.log("IntelligenceEvent:");
  console.log(`- total: ${totalEvents}`);
  console.log(`- active: ${activeEvents}`);
  console.log(`- archived: ${archivedEvents}`);
  console.log(`- malformed embeddings: ${malformedEmbeddings}`);
  console.log(`- duplicate contentHash: ${duplicateContentHash}`);
  console.log(`- duplicate slug: ${duplicateSlug}`);
  console.log(`- missing metadata: ${missingMetadata}`);
  console.log(`- entity mapping percentages: ${totalEvents > 0 ? Math.round((withCountries/totalEvents)*100) : 0}%\n`);

  const totalChunks = await BlogChunk.countDocuments();
  const indexedBlogs = (await BlogChunk.distinct('blogId')).length;
  const malformedChunks = await BlogChunk.countDocuments({
    $or: [{ embedding: { $exists: false } }, { embedding: { $size: 0 } }]
  });
  
  console.log("BlogChunk:");
  console.log(`- total: ${totalChunks}`);
  console.log(`- indexed blogs: ${indexedBlogs}`);
  console.log(`- malformed embeddings: ${malformedChunks}`);
  
  const publishedBlogs = await Blog.countDocuments({ status: "published" });
  const mismatch = publishedBlogs - indexedBlogs;
  
  console.log("\nBlog:");
  console.log(`- published count: ${publishedBlogs}`);
  console.log(`- mismatch between published blogs and indexed blogs: ${mismatch}`);
  
  process.exit(0);
}

finalAudit().catch(console.error);
