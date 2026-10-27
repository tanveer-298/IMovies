const fs = require('fs');
const testPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\server\\tests\\api.test.js';
let content = fs.readFileSync(testPath, 'utf8');

// In before hook, let's reset seats of the first show so tests are 100% idempotent
content = content.replace(
  "before(async () => {",
  `before(async () => {
    // Reset any test seat holds on test start
    const Show = require('../src/models/Show');
    await Show.updateMany({}, {
      $set: {
        'seats.$[elem].status': 'available',
        'seats.$[elem].heldBy': null,
        'seats.$[elem].heldUntil': null
      }
    }, { arrayFilters: [{ 'elem.status': { $in: ['held', 'booked'] } }] });
`
);

fs.writeFileSync(testPath, content, 'utf8');
console.log('Made tests fully idempotent');
