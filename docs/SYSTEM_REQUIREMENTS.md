# IMovies — System Requirements & Troubleshooting Guide

## 1. Software Requirements
- **Operating System**: Windows 10/11, macOS, or Linux.
- **Node.js**: Node.js 20 LTS or Node.js 24 compatible runtime.
- **npm**: npm 10+ (use `npm.cmd` on Windows PowerShell if execution policies are restricted).
- **Database**: MongoDB Community Server 7.0+ or MongoDB Atlas connection string.
- **Web Browser**: Google Chrome 110+, Mozilla Firefox 110+, or Microsoft Edge.
- **Git**: Git 2.30+ for version control.
- **IDE**: Antigravity IDE or Visual Studio Code.
- **API Client**: Postman or Thunder Client (compatible with endpoints in `docs/API.md`).

## 2. Hardware Requirements
- **Processor**: Intel Core i5 8th Gen / AMD Ryzen 5 or higher.
- **RAM**: 8 GB minimum (16 GB recommended).
- **Disk Storage**: At least 1.5 GB free disk space for node_modules and builds.
- **Display Resolution**: 1366x768 minimum (1920x1080 recommended for cinema seat grid).

## 3. Common Troubleshooting Scenarios

### Problem A: PowerShell `npm.ps1 cannot be loaded because running scripts is disabled`
- **Cause**: Windows PowerShell Restricted execution policy.
- **Solution**: Call `npm.cmd` instead of `npm` in PowerShell, e.g.:
  ```powershell
  npm.cmd run dev
  npm.cmd install
  ```
  Or run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned`.

### Problem B: MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
- **Cause**: Local MongoDB service is stopped.
- **Solution**: Start the service in Windows PowerShell:
  ```powershell
  Start-Service -Name MongoDB
  ```
  Or check status with: `Get-Service -Name MongoDB`. Alternatively, supply a cloud MongoDB Atlas URI in `server/.env`.

### Problem C: Port Conflicts (Port 5000 or 5173 Already in Use)
- **Solution**:
  - For server: Change `PORT=5001` in `server/.env`.
  - For client: Vite automatically selects the next available port (e.g. 5174).

### Problem D: CORS Error on API Request
- **Solution**: Ensure `CLIENT_URL=http://localhost:5173` matches your frontend dev URL in `server/.env`. The server is configured to accept requests from `localhost:5173` and `127.0.0.1:5173`.