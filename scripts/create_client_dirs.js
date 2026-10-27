const fs = require('fs');
const path = require('path');

const dirs = [
  'client/src/components',
  'client/src/context',
  'client/src/pages',
  'client/src/services',
  'client/src/utils',
  'client/src/assets'
];

dirs.forEach(d => {
  const full = path.join('C:\\Users\\mansu\\.antigravity-ide\\IMovies', d);
  fs.mkdirSync(full, { recursive: true });
});
console.log('Client directories created successfully');
