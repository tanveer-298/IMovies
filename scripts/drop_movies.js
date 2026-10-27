const path = require('path');
module.paths.push(path.join(__dirname, '../server/node_modules'));
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const mongoose = require('mongoose');

async function dropIndex() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies_db');
  try {
    await mongoose.connection.collection('movies').drop();
    console.log('Movies collection dropped cleanly.');
  } catch(e) {
    console.log('Collection drop error (probably didn\'t exist):', e.message);
  }
  process.exit(0);
}
dropIndex();
