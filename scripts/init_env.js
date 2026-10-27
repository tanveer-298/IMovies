const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies';

const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Node modules
node_modules
dist
dist-ssr
*.local

# Environment files
.env
.env.production
.env.local

# Editor & OS
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
Thumbs.db
`;

fs.writeFileSync(path.join(baseDir, '.gitignore'), gitignoreContent);

const envExampleContent = `# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration
MONGODB_URI=mongodb://127.0.0.1:27017/imovies_db

# Security & Authentication
JWT_SECRET=imovies_super_secret_jwt_key_2026_cinematic_production
JWT_EXPIRES_IN=7d

# App Settings
SEAT_HOLD_DURATION_MINUTES=5
`;

fs.writeFileSync(path.join(baseDir, '.env.example'), envExampleContent);
fs.writeFileSync(path.join(baseDir, 'server', '.env.example'), envExampleContent);
fs.writeFileSync(path.join(baseDir, 'server', '.env'), envExampleContent);

console.log('Environment and gitignore files created successfully');
