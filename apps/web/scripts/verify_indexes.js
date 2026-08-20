require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function runIndexAudit() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/global-chanakya');
  console.log('Connected to MongoDB.');
  
  const BlogSchema = new mongoose.Schema({}, { strict: false });
  BlogSchema.index({ status: 1, publishAt: -1 });
  BlogSchema.index({ category: 1, status: 1 });
  BlogSchema.index({ tags: 1 });
  BlogSchema.index({ 'analytics.views': -1 });
  BlogSchema.index({ categoryId: 1, status: 1, publishAt: -1 });
  BlogSchema.index({ topics: 1, status: 1, publishAt: -1 });
  BlogSchema.index({ countries: 1, status: 1, publishAt: -1 });
  BlogSchema.index({ regions: 1, status: 1, publishAt: -1 });
  BlogSchema.index({ leaders: 1, status: 1, publishAt: -1 });
  BlogSchema.index({ conflicts: 1, status: 1, publishAt: -1 });
  BlogSchema.index({ organizations: 1, status: 1, publishAt: -1 });
  
  const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

  console.log('Syncing indexes...');
  await Blog.syncIndexes();
  
  const newIndexes = await Blog.collection.indexes();
  console.log('NEW INDEXES:');
  console.log(JSON.stringify(newIndexes, null, 2));

  const someCountryId = new mongoose.Types.ObjectId('6a57178ed9dbd4efa0554fa6'); // India
  const explainPlan = await Blog.find({ countries: someCountryId, status: 'published' }).sort({ publishAt: -1 }).explain('executionStats');
  
  console.log('EXPLAIN PLAN AFTER INDEXING:');
  console.log(JSON.stringify(explainPlan, null, 2));

  mongoose.connection.close();
}

runIndexAudit().catch(console.error);
