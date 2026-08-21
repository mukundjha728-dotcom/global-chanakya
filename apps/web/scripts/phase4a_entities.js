require("dotenv").config({path:".env.local"});
const mongoose = require("mongoose");
const fs = require("fs");
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  // Get all taxonomy entities for mapping
  const topics = await db.collection("topics").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const countries = await db.collection("countries").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const leaders = await db.collection("leaders").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const conflicts = await db.collection("conflicts").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const organizations = await db.collection("organizations").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  const categories = await db.collection("categories").find({},{projection:{_id:1,name:1,slug:1}}).toArray();
  
  const entities = {
    topics: topics.map(e => ({id:e._id.toString(), name:e.name, slug:e.slug})),
    countries: countries.map(e => ({id:e._id.toString(), name:e.name, slug:e.slug})),
    leaders: leaders.map(e => ({id:e._id.toString(), name:e.name, slug:e.slug})),
    conflicts: conflicts.map(e => ({id:e._id.toString(), name:e.name, slug:e.slug})),
    organizations: organizations.map(e => ({id:e._id.toString(), name:e.name, slug:e.slug})),
    categories: categories.map(e => ({id:e._id.toString(), name:e.name, slug:e.slug})),
  };
  
  fs.writeFileSync("/tmp/phase4a_entities.json", JSON.stringify(entities, null, 2));
  console.log("Topics:", topics.map(t=>t.name).join(", "));
  console.log("Countries:", countries.map(t=>t.name).join(", "));
  console.log("Leaders:", leaders.map(t=>t.name).join(", "));
  console.log("Conflicts:", conflicts.map(t=>t.name).join(", "));
  console.log("Organizations:", organizations.map(t=>t.name).join(", "));
  console.log("Categories:", categories.map(t=>t.name+" ("+t._id+"): "+t.slug).join(", "));
  
  await mongoose.connection.close();
}
run().catch(console.error);
