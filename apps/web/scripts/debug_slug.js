const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const entitySchema = new mongoose.Schema({ name: String, slug: String }, { strict: false });
  const allDbDocs = {
    Category: await mongoose.model('Category', entitySchema, 'categories').find({}).lean(),
    Region: await mongoose.model('Region', entitySchema, 'regions').find({}).lean(),
    Country: await mongoose.model('Country', entitySchema, 'countries').find({}).lean(),
    Topic: await mongoose.model('Topic', entitySchema, 'topics').find({}).lean(),
    Leader: await mongoose.model('Leader', entitySchema, 'leaders').find({}).lean(),
    Conflict: await mongoose.model('Conflict', entitySchema, 'conflicts').find({}).lean(),
    Organization: await mongoose.model('Organization', entitySchema, 'organizations').find({}).lean()
  };

  const uniqueSlugs = new Set();
  Object.values(allDbDocs).flat().forEach(d => {
    if (uniqueSlugs.has(d.slug)) {
      console.log('Duplicate slug found:', d.slug, d.name);
    }
    uniqueSlugs.add(d.slug);
  });
  await mongoose.disconnect();
}
run();
