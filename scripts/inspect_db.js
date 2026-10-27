const path = require('path');
module.paths.push(path.join(__dirname, '../server/node_modules'));
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const mongoose = require('mongoose');

async function inspectDB() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies_db');
  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log('=== COLLECTIONS & DOCUMENT COUNTS ===');
  for (let c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(`- ${c.name}: ${count} documents`);
  }

  console.log('\n=== REGISTERED USERS IN DATABASE ===');
  const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
  console.log(JSON.stringify(users, null, 2));

  process.exit(0);
}
inspectDB();
