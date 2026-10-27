const fs = require('fs');

const readmePath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\README.md';
let readme = fs.readFileSync(readmePath, 'utf8');

const target = "- **Backend REST API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)";
const replacement = `- **Backend REST API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Live Project Demo Video:** [https://raw.githubusercontent.com/tanveer-298/IMovies/main/docs/imovies_demo_walkthrough.webp](https://raw.githubusercontent.com/tanveer-298/IMovies/main/docs/imovies_demo_walkthrough.webp)`;

readme = readme.replace(target, replacement);
fs.writeFileSync(readmePath, readme, 'utf8');
console.log('README.md updated with Demo Video link');
