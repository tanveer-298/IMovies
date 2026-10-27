const fs = require('fs');

const readmePath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\README.md';
let readme = fs.readFileSync(readmePath, 'utf8');

const oldSection = `## 📌 Project Links for Mentor Review

- **GitHub Repository:** [https://github.com/tanveer-298/IMovies](https://github.com/tanveer-298/IMovies)  
  <!-- MENTOR_SUBMISSION_PLACEHOLDER: Replace "Not published yet." with your repository URL once authorized -->
- **Live Production Demo:** \`Not deployed yet.\`  
  <!-- MENTOR_SUBMISSION_PLACEHOLDER: Replace "Not deployed yet." with your live hosting URL once deployed -->`;

const newSection = `## 📌 Project Links for Mentor Review & Evaluation

- **GitHub Repository:** [https://github.com/tanveer-298/IMovies](https://github.com/tanveer-298/IMovies)
- **Local Frontend Application (React 19 + Vite):** [http://localhost:5173](http://localhost:5173)
- **Backend REST API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Pre-configured 1-Click Windows Launcher:** \`start-imovies.bat\` in root folder (launches both frontend and backend instantly)`;

readme = readme.replace(oldSection, newSection);
fs.writeFileSync(readmePath, readme, 'utf8');
console.log('README.md updated with localhost URLs');
