import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db!;
  const slugs = [
    'hormuz-black-sea-chokepoints-iran-ukraine-oil-food-weaponization',
    'caspian-convergence-ukraine-iran-wars',
    'yemen-ukraine-convergence-drone-war-distant-fronts-2026',
  ];
  for (const slug of slugs) {
    const doc: any = await db.collection('blogs').findOne({ slug });
    if (!doc) { console.log('NOT FOUND:', slug); continue; }
    const keys = Object.keys(doc);
    const contentLen = (doc.content || '').length;
    const markdownLen = (doc.markdown || '').length;
    console.log(slug);
    console.log('  keys:', keys.join(', '));
    console.log('  content len:', contentLen);
    console.log('  markdown len:', markdownLen);
    const sample = (doc.content || doc.markdown || '').substring(0, 300);
    console.log('  sample:', sample);
  }
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
