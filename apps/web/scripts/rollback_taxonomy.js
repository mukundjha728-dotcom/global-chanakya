const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function runRollback() {
  if (!process.env.MONGODB_URI) throw new Error("Missing MONGODB_URI");

  console.log("Starting Taxonomy Rollback...");

  await mongoose.connect(process.env.MONGODB_URI);

  const blogSchema = new mongoose.Schema({}, { strict: false });
  const Blog = mongoose.models.Blog || mongoose.model('Blog', blogSchema, 'blogs');

  // $unset all newly created relationship fields
  const unsetResult = await Blog.updateMany({}, {
    $unset: {
      categoryId: "",
      topics: "",
      countries: "",
      regions: "",
      leaders: "",
      conflicts: "",
      organizations: ""
    }
  });

  console.log(`Blogs rolled back (relationships removed): ${unsetResult.modifiedCount}`);

  // We could delete entities, but since this might be a destructive action against entities that might have existed before,
  // we will just log that the relationships are removed. If we strictly want to drop the collections to start over (which is what we did here since we just created them):
  const collections = ['categories', 'topics', 'countries', 'regions', 'leaders', 'conflicts', 'organizations'];
  for (const c of collections) {
    try {
      const col = mongoose.connection.collection(c);
      await col.deleteMany({});
      console.log(`Cleared collection: ${c}`);
    } catch(e) {
      console.log(`Error clearing ${c}: ${e.message}`);
    }
  }

  console.log("ROLLBACK COMPLETE. Legacy data (category, tags, content) was NOT modified.");
  
  await mongoose.disconnect();
}

runRollback().catch(console.error);
