const fs = require('fs');
const movieModelPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\server\\src\\models\\Movie.js';
let content = fs.readFileSync(movieModelPath, 'utf8');
content = content.replace(
  "movieSchema.index({ title: 'text', description: 'text', genre: 'text' });",
  "movieSchema.index({ title: 'text', description: 'text' }, { language_override: 'none' });"
);
fs.writeFileSync(movieModelPath, content, 'utf8');
console.log('Fixed text index language_override in Movie.js');
