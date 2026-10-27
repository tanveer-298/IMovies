const fs = require('fs');

// 1. README.md
const readmePath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\README.md';
let readme = fs.readFileSync(readmePath, 'utf8');
readme = readme.replace(
  "- **GitHub Repository:** `Not published yet.`",
  "- **GitHub Repository:** [https://github.com/tanveer-298/IMovies](https://github.com/tanveer-298/IMovies)"
);
fs.writeFileSync(readmePath, readme, 'utf8');

// 2. Footer.jsx
const footerPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\components\\Footer.jsx';
let footer = fs.readFileSync(footerPath, 'utf8');
footer = footer.replace(
  `<span className="badge bg-secondary">Pending URL</span>\n                </div>\n                <div className="text-white fw-semibold">Not published yet.</div>`,
  `<span className="badge bg-success">Verified</span>\n                </div>\n                <a href="https://github.com/tanveer-298/IMovies" target="_blank" rel="noopener noreferrer" className="text-danger fw-semibold text-decoration-none">github.com/tanveer-298/IMovies</a>`
);
fs.writeFileSync(footerPath, footer, 'utf8');

// 3. WorkspacePage.jsx
const wsPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\WorkspacePage.jsx';
let ws = fs.readFileSync(wsPath, 'utf8');
ws = ws.replace(
  `<div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small">GitHub Repository:</span>
                    <span className="badge bg-secondary">Unpublished</span>
                  </div>
                  <div className="text-white fw-bold">Not published yet.</div>`,
  `<div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small">GitHub Repository:</span>
                    <span className="badge bg-success">Verified</span>
                  </div>
                  <a href="https://github.com/tanveer-298/IMovies" target="_blank" rel="noopener noreferrer" className="text-danger fw-bold text-decoration-none">github.com/tanveer-298/IMovies</a>`
);
fs.writeFileSync(wsPath, ws, 'utf8');

console.log('Updated verified GitHub repository link in README, Footer, and WorkspacePage');
