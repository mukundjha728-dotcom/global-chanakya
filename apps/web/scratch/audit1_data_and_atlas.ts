import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import dbConnect from '../src/lib/mongoose';
import { IntelligenceEvent } from '../src/lib/models/IntelligenceEvent';
import { BlogChunk } from '../src/lib/models/BlogChunk';
import { Blog } from '../src/lib/models/Blog';
import mongoose from 'mongoose';

async function auditData() {
  await dbConnect();
  
  const totalEvents = await IntelligenceEvent.countDocuments();
  const activeEvents = await IntelligenceEvent.countDocuments({ status: "published" });
  const archivedEvents = await IntelligenceEvent.countDocuments({ status: "archived" });
  
  const eventsWithCountry = await IntelligenceEvent.countDocuments({ countryTags: { $exists: true, $not: {$size: 0} } });
  const eventsWithLeader = await IntelligenceEvent.countDocuments({ leaderTags: { $exists: true, $not: {$size: 0} } });
  const eventsWithConflict = await IntelligenceEvent.countDocuments({ conflictTags: { $exists: true, $not: {$size: 0} } });
  const eventsWithAny = await IntelligenceEvent.countDocuments({ 
    $or: [
      { countryTags: { $exists: true, $not: {$size: 0} } },
      { leaderTags: { $exists: true, $not: {$size: 0} } },
      { conflictTags: { $exists: true, $not: {$size: 0} } }
    ]
  });

  console.log("=== EVENT LIFECYCLE & ENTITY RESOLUTION ===");
  console.log(`Total Events: ${totalEvents}`);
  console.log(`Active Events: ${activeEvents}`);
  console.log(`Archived Events: ${archivedEvents}`);
  if (totalEvents > 0) {
    console.log(`Events w/ Country: ${eventsWithCountry} (${Math.round((eventsWithCountry/totalEvents)*100)}%)`);
    console.log(`Events w/ Leader: ${eventsWithLeader} (${Math.round((eventsWithLeader/totalEvents)*100)}%)`);
    console.log(`Events w/ Conflict: ${eventsWithConflict} (${Math.round((eventsWithConflict/totalEvents)*100)}%)`);
    console.log(`Unresolved Events: ${totalEvents - eventsWithAny} (${Math.round(((totalEvents - eventsWithAny)/totalEvents)*100)}%)`);
  }

  if (totalEvents > 0) {
    const sample = await IntelligenceEvent.findOne({ countryTags: { $exists: true, $not: {$size: 0} } });
    console.log(`\nSample Mapped Event: ${sample?.title}`);
    console.log(`  Countries: ${sample?.countryTags}`);
    console.log(`  Leaders: ${sample?.leaderTags}`);
    console.log(`  Conflicts: ${sample?.conflictTags}`);
  }

  const totalChunks = await BlogChunk.countDocuments();
  const publishedBlogs = await Blog.countDocuments({ status: "published" });

  console.log("\n=== INTERNAL RAG REGRESSION ===");
  console.log(`Published Blogs: ${publishedBlogs}`);
  console.log(`BlogChunks: ${totalChunks}`);

  // Atlas Index
  try {
    const db = mongoose.connection.db;
    if (db) {
      const indexes = await db.collection('intelligenceevents').listSearchIndexes().toArray();
      console.log("\n=== LIVE VECTOR SEARCH ===");
      console.log("Atlas Search Indexes for intelligenceevents:", JSON.stringify(indexes, null, 2));
    }
  } catch(e) {
    console.log("Atlas Index Error:", e);
  }
  
  process.exit(0);
}

auditData();
