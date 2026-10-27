const fs = require('fs');

const testCode = `
const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const mongoose = require('mongoose');

module.paths.push(path.join(__dirname, '../node_modules'));
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('../src/app');
let server;
let baseUrl;

before(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies_db');
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = \`http://localhost:\${port}\`;
      resolve();
    });
  });
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await mongoose.disconnect();
});

describe('IMovies Full API Automated Test Suite', () => {

  test('GET /api/health should return online status', async () => {
    const res = await fetch(\`\${baseUrl}/api/health\`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'online');
    assert.strictEqual(data.service, 'IMovies REST API Server');
  });

  let userToken = '';
  let adminToken = '';

  test('POST /api/auth/login should authenticate demo customer', async () => {
    const res = await fetch(\`\${baseUrl}/api/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@imovies.com',
        password: 'User@123password'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.role, 'user');
    userToken = data.token;
  });

  test('POST /api/auth/login should authenticate admin user', async () => {
    const res = await fetch(\`\${baseUrl}/api/auth/login\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@imovies.com',
        password: 'Admin@123password'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.token);
    assert.strictEqual(data.user.role, 'admin');
    adminToken = data.token;
  });

  test('GET /api/auth/me should return current user profile with valid JWT', async () => {
    const res = await fetch(\`\${baseUrl}/api/auth/me\`, {
      headers: { Authorization: \`Bearer \${userToken}\` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.email, 'demo@imovies.com');
  });

  test('GET /api/auth/me should reject request without token', async () => {
    const res = await fetch(\`\${baseUrl}/api/auth/me\`);
    assert.strictEqual(res.status, 401);
  });

  test('GET /api/movies should return list of movies with pagination', async () => {
    const res = await fetch(\`\${baseUrl}/api/movies\`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.movies.length >= 10);
  });

  test('GET /api/movies/featured should return featured, trending, and coming soon movies', async () => {
    const res = await fetch(\`\${baseUrl}/api/movies/featured\`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.trending.length > 0);
    assert.ok(data.nowShowing.length > 0);
    assert.ok(data.comingSoon.length > 0);
  });

  test('GET /api/cinemas should return cinemas with city listing', async () => {
    const res = await fetch(\`\${baseUrl}/api/cinemas\`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.cinemas.length >= 4);
    assert.ok(data.cities.includes('Mumbai'));
  });

  test('GET /api/tasks should return exactly 19 primary Kanban tasks across 6 epics', async () => {
    const res = await fetch(\`\${baseUrl}/api/tasks\`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.count, 19);

    const statsRes = await fetch(\`\${baseUrl}/api/tasks/stats\`);
    const statsData = await statsRes.json();
    assert.strictEqual(statsData.stats.totalEpics, 6);
    assert.strictEqual(statsData.stats.totalTasks, 19);
    assert.strictEqual(statsData.stats.totalSubtasks, 0);
  });

  let testShowId = '';
  let availableSeats = [];

  test('GET /api/shows should return active shows and allow fetching show seat layout', async () => {
    const res = await fetch(\`\${baseUrl}/api/shows\`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.shows.length > 0);
    testShowId = data.shows[0]._id;

    const showDetails = await fetch(\`\${baseUrl}/api/shows/\${testShowId}\`);
    assert.strictEqual(showDetails.status, 200);
    const showData = await showDetails.json();
    assert.ok(showData.show.seats.length > 0);
    availableSeats = showData.show.seats.filter(s => s.status === 'available').map(s => s.seatId);
    assert.ok(availableSeats.length >= 6);
  });

  test('Seat Hold & Concurrency: POST /api/bookings/hold should hold seats and prevent conflicts', async () => {
    const seat1 = availableSeats[0];
    const seat2 = availableSeats[1];

    // 1. Hold seats
    const holdRes = await fetch(\`\${baseUrl}/api/bookings/hold\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${userToken}\`
      },
      body: JSON.stringify({
        showId: testShowId,
        seatIds: [seat1, seat2]
      })
    });
    assert.strictEqual(holdRes.status, 200);

    // 2. Another user tries to hold seat1 -> Should return 409 Conflict
    const conflictRes = await fetch(\`\${baseUrl}/api/bookings/hold\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${adminToken}\`
      },
      body: JSON.stringify({
        showId: testShowId,
        seatIds: [seat1]
      })
    });
    assert.strictEqual(conflictRes.status, 409);
    const conflictData = await conflictRes.json();
    assert.strictEqual(conflictData.success, false);
    assert.ok(conflictData.conflictingSeats.some(s => s.seatId === seat1));
  });

  test('Simulated Payment Failure: POST /api/bookings with failure outcome should release seats', async () => {
    const seat1 = availableSeats[0];
    const seat2 = availableSeats[1];

    const failRes = await fetch(\`\${baseUrl}/api/bookings\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${userToken}\`
      },
      body: JSON.stringify({
        showId: testShowId,
        seatIds: [seat1, seat2],
        paymentMethod: 'credit_card',
        simulateOutcome: 'failure'
      })
    });
    assert.strictEqual(failRes.status, 400);
    const failData = await failRes.json();
    assert.strictEqual(failData.success, false);

    // Verify seats were released back to available
    const showCheck = await fetch(\`\${baseUrl}/api/shows/\${testShowId}\`);
    const checkData = await showCheck.json();
    const seatObj = checkData.show.seats.find(s => s.seatId === seat1);
    assert.strictEqual(seatObj.status, 'available');
  });

  let createdBookingId = '';
  test('Simulated Payment Success: POST /api/bookings should calculate server price and book seats', async () => {
    const seat3 = availableSeats[2];
    const seat4 = availableSeats[3];

    // 1. Hold seats
    await fetch(\`\${baseUrl}/api/bookings/hold\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${userToken}\`
      },
      body: JSON.stringify({
        showId: testShowId,
        seatIds: [seat3, seat4]
      })
    });

    // 2. Complete simulated payment
    const bookRes = await fetch(\`\${baseUrl}/api/bookings\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${userToken}\`
      },
      body: JSON.stringify({
        showId: testShowId,
        seatIds: [seat3, seat4],
        paymentMethod: 'simulated_fast_pay',
        simulateOutcome: 'success'
      })
    });
    assert.strictEqual(bookRes.status, 201);
    const bookData = await bookRes.json();
    assert.strictEqual(bookData.success, true);
    assert.ok(bookData.booking.bookingReference.startsWith('IMV-'));
    assert.strictEqual(bookData.booking.bookingStatus, 'confirmed');
    assert.ok(bookData.booking.totalAmount > 0);
    createdBookingId = bookData.booking._id;
  });

  test('GET /api/bookings/my-bookings should return user bookings with ownership check', async () => {
    const res = await fetch(\`\${baseUrl}/api/bookings/my-bookings\`, {
      headers: { Authorization: \`Bearer \${userToken}\` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.bookings.length >= 1);
    assert.ok(data.bookings.some(b => b._id === createdBookingId));
  });

  test('Admin Authorization: GET /api/admin/stats should allow admin but reject standard user', async () => {
    const userRes = await fetch(\`\${baseUrl}/api/admin/stats\`, {
      headers: { Authorization: \`Bearer \${userToken}\` }
    });
    assert.strictEqual(userRes.status, 403);

    const adminRes = await fetch(\`\${baseUrl}/api/admin/stats\`, {
      headers: { Authorization: \`Bearer \${adminToken}\` }
    });
    assert.strictEqual(adminRes.status, 200);
    const adminData = await adminRes.json();
    assert.ok(adminData.stats.totalBookings >= 1);
    assert.ok(adminData.stats.totalRevenue > 0);
  });
});
`;

fs.writeFileSync('C:\\Users\\mansu\\.antigravity-ide\\IMovies\\server\\tests\\api.test.js', testCode.trim(), 'utf8');
console.log('Updated api.test.js with dynamic seat resolution');
