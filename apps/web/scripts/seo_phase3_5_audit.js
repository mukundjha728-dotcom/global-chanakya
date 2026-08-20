require('dotenv').config({ path: 'c:/Users/mukun/Downloads/global-chanakya-1/apps/web/.env.local' });
const mongoose = require('mongoose');

async function runAudit() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/global-chanakya");
  console.log("Connected to MongoDB.");
  
  // 1. Entities
  const entities = [
    { model: 'Category', path: 'categories', field: 'categoryId' },
    { model: 'Topic', path: 'topics', field: 'topics' },
    { model: 'Country', path: 'countries', field: 'countries' },
    { model: 'Region', path: 'regions', field: 'regions' },
    { model: 'Leader', path: 'leaders', field: 'leaders' },
    { model: 'Conflict', path: 'conflicts', field: 'conflicts' },
    { model: 'Organization', path: 'organizations', field: 'organizations' },
  ];
  
  const Blog = mongoose.models.Blog || mongoose.model('Blog', new mongoose.Schema({}, { strict: false }));
  
  const reportData = {
    entities: {}
  };

  for (const config of entities) {
    const Model = mongoose.models[config.model] || mongoose.model(config.model, new mongoose.Schema({}, { strict: false }));
    const docs = await Model.find({}).lean();
    
    reportData.entities[config.model] = {
      total: docs.length,
      sampleHigh: null,
      sampleMedium: null,
      sampleThin: null,
      sampleZero: null
    };

    for (const doc of docs) {
      const count = await Blog.countDocuments({ [config.field]: doc._id, status: 'published' });
      doc.articleCount = count;
      if (count >= 4 && !reportData.entities[config.model].sampleHigh) reportData.entities[config.model].sampleHigh = doc;
      else if (count >= 2 && count < 4 && !reportData.entities[config.model].sampleMedium) reportData.entities[config.model].sampleMedium = doc;
      else if (count === 1 && !reportData.entities[config.model].sampleThin) reportData.entities[config.model].sampleThin = doc;
      else if (count === 0 && !reportData.entities[config.model].sampleZero) reportData.entities[config.model].sampleZero = doc;
    }
  }

  console.log(JSON.stringify(reportData.entities, null, 2));

  mongoose.connection.close();
}

runAudit().catch(console.error);
