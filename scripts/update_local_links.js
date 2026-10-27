const fs = require('fs');

// 1. Footer.jsx
const footerPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\components\\Footer.jsx';
let footer = fs.readFileSync(footerPath, 'utf8');

footer = footer.replace(
  `<div className="text-white fw-semibold">Not deployed yet.</div>`,
  `<a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="text-warning fw-semibold text-decoration-none">http://localhost:5173</a>`
);
footer = footer.replace(
  `<span className="badge bg-secondary">Pending Deploy</span>`,
  `<span className="badge bg-success">Localhost:5173</span>`
);
fs.writeFileSync(footerPath, footer, 'utf8');

// 2. WorkspacePage.jsx
const wsPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\WorkspacePage.jsx';
let ws = fs.readFileSync(wsPath, 'utf8');

ws = ws.replace(
  `<div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small">Live Production Demo:</span>
                    <span className="badge bg-secondary">Undeployed</span>
                  </div>
                  <div className="text-white fw-bold">Not deployed yet.</div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                    Health check ready at /api/health
                  </div>`,
  `<div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small">Local Application Demo:</span>
                    <span className="badge bg-success">Active</span>
                  </div>
                  <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer" className="text-warning fw-bold text-decoration-none">http://localhost:5173</a>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                    Backend Health Check: <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer" className="text-info text-decoration-none">http://localhost:5000/api/health</a>
                  </div>`
);
fs.writeFileSync(wsPath, ws, 'utf8');

console.log('Updated Footer and WorkspacePage with localhost links');
