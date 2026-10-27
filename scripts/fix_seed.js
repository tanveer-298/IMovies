const fs = require('fs');
const path = require('path');
const seedPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\scripts\\seedData.js';
let content = fs.readFileSync(seedPath, 'utf8');
content = `const path = require('path');
module.paths.push(path.join(__dirname, '../server/node_modules'));\n` + content;
fs.writeFileSync(seedPath, content, 'utf8');
console.log('Updated seedData.js with module.paths');
