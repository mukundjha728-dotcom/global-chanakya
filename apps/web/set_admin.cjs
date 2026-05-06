const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://chanakya_admin:chanakya%40123@cluster0.qacfv4h.mongodb.net/global_chanakya?appName=Cluster0';

async function setAdmin() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('global_chanakya');

  // Check what users exist now
  const allUsers = await db.collection('users').find({}).toArray();
  console.log('Current users:', JSON.stringify(allUsers.map(u => ({ email: u.email, name: u.name, role: u.role })), null, 2));

  // Set admin role for mukundjha728@gmail.com
  const result = await db.collection('users').updateOne(
    { email: 'mukundjha728@gmail.com' },
    { $set: { role: 'admin', provider: 'google' } }
  );
  console.log('Updated:', result.modifiedCount, 'document(s)');

  await client.close();
}
setAdmin().catch(console.error);
