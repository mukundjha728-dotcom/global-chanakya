import { Blog } from '../src/lib/models/Blog';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function sync() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/global-chanakya');
  console.log('Syncing indexes...');
  await Blog.syncIndexes();
  const indexes = await Blog.collection.indexes();
  console.log('Current Indexes:', indexes.map(i => i.name));
  await mongoose.connection.close();
}

sync().catch(console.error);
