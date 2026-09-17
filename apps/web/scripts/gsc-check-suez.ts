import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  const doc: any = await db.collection('blogs').findOne({ slug: 'suez-canal-2026-strategic-importance-global-trade-egypt' });
  if (!doc) { console.log('NOT FOUND'); process.exit(1); }
  console.log('title:', doc.title);
  console.log('seo.title:', doc.seo && doc.seo.title);
  console.log('seo.description:', doc.seo && doc.seo.description);
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
