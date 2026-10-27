const fs = require('fs');
const rootPkgPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\package.json';
let text = fs.readFileSync(rootPkgPath, 'utf8').replace(/^\uFEFF/, '');
const rootPkg = JSON.parse(text);
rootPkg.scripts['view-users'] = 'node scripts/inspect_db.js';
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2), 'utf8');
console.log('Script view-users added successfully');
