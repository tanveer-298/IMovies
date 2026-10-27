const fs = require('fs');

// 1. Navbar.jsx
const navPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\components\\Navbar.jsx';
let nav = fs.readFileSync(navPath, 'utf8');
nav = nav.replace(/KanBan/g, 'Kanban');
fs.writeFileSync(navPath, nav, 'utf8');

// 2. Footer.jsx
const footerPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\components\\Footer.jsx';
let foot = fs.readFileSync(footerPath, 'utf8');
foot = foot.replace(/Github/g, 'FolderGit2');
fs.writeFileSync(footerPath, foot, 'utf8');

// 3. WorkspacePage.jsx
const wsPath = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\client\\src\\pages\\WorkspacePage.jsx';
let ws = fs.readFileSync(wsPath, 'utf8');
ws = ws.replace(/KanBan/g, 'Kanban');
fs.writeFileSync(wsPath, ws, 'utf8');

console.log('Fixed Lucide icons imports');
