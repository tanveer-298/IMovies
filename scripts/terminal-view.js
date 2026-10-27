const path = require('path');
module.paths.push(path.join(__dirname, '../server/node_modules'));
require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
const mongoose = require('mongoose');

async function runCLI() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies_db');
  const db = mongoose.connection.db;

  console.log('\n========================================================================================');
  console.log('🎬 IMOVIES DATABASE — TERMINAL LIVE VIEW');
  console.log('========================================================================================\n');

  // 1. Users Table
  console.log('👤 REGISTERED USERS:');
  const users = await db.collection('users').find({}, { projection: { password: 0, __v: 0 } }).toArray();
  const formattedUsers = users.map((u, i) => ({
    '#': i + 1,
    'Name': u.name,
    'Email': u.email,
    'Phone': u.phone || 'N/A',
    'Role': u.role.toUpperCase(),
    'Registered At': new Date(u.createdAt).toLocaleString()
  }));
  console.table(formattedUsers);

  // 2. Bookings Table
  console.log('\n🎟️ RECENT TICKET BOOKINGS:');
  const bookings = await db.collection('bookings').find({}).sort({ createdAt: -1 }).toArray();
  const formattedBookings = bookings.map((b, i) => ({
    '#': i + 1,
    'Reference': b.bookingReference,
    'Seats': b.seats ? b.seats.map(s => s.seatId).join(', ') : 'N/A',
    'Amount': '₹' + b.totalAmount,
    'Status': b.bookingStatus.toUpperCase(),
    'Booked At': new Date(b.createdAt).toLocaleString()
  }));
  console.table(formattedBookings);

  // 3. Collections Summary
  console.log('\n📊 DATABASE SUMMARY:');
  const collections = await db.listCollections().toArray();
  const summary = [];
  for (let c of collections) {
    const count = await db.collection(c.name).countDocuments();
    summary.push({ 'Collection': c.name, 'Total Records': count });
  }
  console.table(summary);

  console.log('========================================================================================\n');
  process.exit(0);
}
runCLI();
