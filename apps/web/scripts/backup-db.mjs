import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

let envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) envPath = path.resolve(process.cwd(), 'apps/web/.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ CRITICAL: MONGODB_URI is required for backups.");
  process.exit(1);
}

async function backupDB() {
  console.log("📦 Starting Database Backup...");
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) throw new Error("No DB connection");

    const collectionsToBackup = ['bookmarks', 'likes', 'readinghistories', 'blogs', 'users'];
    const backupDir = path.resolve(process.cwd(), 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    for (const collName of collectionsToBackup) {
      console.log(`Backing up collection: ${collName}...`);
      const coll = db.collection(collName);
      const data = await coll.find({}).toArray();
      
      const filePath = path.join(backupDir, `${collName}_${timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Saved ${data.length} records to ${filePath}`);
    }

    console.log("✅ Backup completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Backup failed:", err);
    process.exit(1);
  }
}

backupDB();
