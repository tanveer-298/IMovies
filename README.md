# IMovies — Movie Ticket Booking Made Simple

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-red.svg)](https://mongodb.com)
[![Tests Passed](https://img.shields.io/badge/Tests-15%2F15%20Passed-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-ISC-blue.svg)]()

> **Project Category:** Entertainment  
> **Project Type:** Individual  
> **Developer Level:** Intermediate MERN Stack  
> **Architecture:** Decoupled React 19 Frontend + Node.js/Express REST Backend + MongoDB  

---

## 📌 Project Links for Mentor Review & Evaluation

- **GitHub Repository:** [https://github.com/tanveer-298/IMovies](https://github.com/tanveer-298/IMovies)
- **Local Frontend Application (React 19 + Vite):** [http://localhost:5173](http://localhost:5173)
- **Backend REST API Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Pre-configured 1-Click Windows Launcher:** `start-imovies.bat` in root folder (launches both frontend and backend instantly)

---

## 🎬 Project Overview

**IMovies** is a full-featured, responsive cinema ticketing web application that solves common real-world movie reservation challenges. It allows customers to discover trending releases, filter films by genre and language, explore multi-format auditoriums (IMAX Laser, Dolby Atmos, 4DX), and reserve specific seats through an interactive theater layout.

### Key Highlights
- **Concurrency-Safe Seat Reservation**: Atomic seat-hold mechanism in MongoDB with 5-minute checkout expiration timer, preventing race conditions and double-booking.
- **Server-Side Price Recalculation**: The backend strictly recalculates all subtotals, convenience fees, and taxes from database seat tiers; frontend prices are never blindly trusted.
- **Simulated Payment Sandbox**: Dedicated test payment system supporting 1-Click Success and 1-Click Failure modes to safely test payment processing and seat releases.
- **Digital QR Entry Passes**: Instant QR code tickets generated via `qrcode.react` with unique booking references (`IMV-XXXXXX`) and automated cancellation policies.
- **Role-Based Admin Portal**: Secure management suite for movie catalogs, multi-screen cinema layouts, showtimes scheduling, and user role administration.
- **Interactive Kanban Board**: Built-in 5-column board tracking exactly **6 Epics and 19 Primary Tasks** with real-time MongoDB status persistence.

---

## 📊 Project Statistics

- **Total Epics:** 6
- **Total Primary Tasks:** 19
- **Total Subtasks:** 0
- **Automated Test Results:** 15 / 15 Passed (100%)

---

## 💻 System Requirements

### Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux
- **Node.js:** Node.js 20 LTS or Node.js 24+
- **Package Manager:** npm (use `npm.cmd` on Windows PowerShell if execution policies are restricted)
- **Database:** MongoDB Community Server (local service on port 27017) or MongoDB Atlas
- **Browser:** Google Chrome 110+, Mozilla Firefox, or Microsoft Edge
- **Git:** Git 2.30+

### Hardware Requirements
- **Processor:** Intel Core i5 8th Gen / AMD Ryzen 5 or higher
- **RAM:** 8 GB minimum (16 GB recommended)
- **Storage:** 1.5 GB free space for project files and node_modules
- **Display:** 1366x768 minimum (1920x1080 recommended for cinema seat grid)

---

## 🚀 Quick Start Guide (Windows PowerShell)

All commands below are tailored for **Windows PowerShell** using `npm.cmd` to avoid any execution policy restrictions.

### 1. Navigate to Project Directory
```powershell
cd C:\Users\mansu\.antigravity-ide\IMovies
```

### 2. Configure Environment Variables
Copy the template to `.env` in the server folder (pre-configured for local MongoDB):
```powershell
Copy-Item .env.example server\.env
```

### 3. Verify or Start MongoDB
Verify that your local MongoDB service is running:
```powershell
Get-Service -Name "*mongo*"
# If stopped, start with:
Start-Service -Name MongoDB
```

### 4. Seed the Database
Populate 10 sample movies, 4 cinemas across major cities, 8 auditoriums, multi-date showtimes, test accounts, and the 19 Kanban tasks:
```powershell
npm.cmd run seed
```

### 5. Run Automated Tests
Execute the comprehensive integration test suite (verifies health, auth, movies, seat holds, payment simulation, and admin access):
```powershell
npm.cmd run test
```

### 6. Start Application Servers
In two separate PowerShell terminal tabs:

**Terminal 1 — Backend REST API (Port 5000):**
```powershell
cd C:\Users\mansu\.antigravity-ide\IMovies\server
npm.cmd run dev
```

**Terminal 2 — Frontend Client (Port 5173):**
```powershell
cd C:\Users\mansu\.antigravity-ide\IMovies\client
npm.cmd run dev
```

Open your browser at **`http://localhost:5173`**.

### 7. Production Frontend Build
To validate or produce the optimized production build:
```powershell
cd C:\Users\mansu\.antigravity-ide\IMovies\client
npm.cmd run build
```

---

## 🔑 Pre-Seeded Test Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@imovies.com` | `Admin@123password` | Full admin portal, movie CRUD, show scheduling |
| **Customer** | `demo@imovies.com` | `User@123password` | Bookings, profile, tickets, cancellations |

*(Quick-fill buttons are also available directly on the login page for convenience.)*

---

## 📋 6 Epics & 19 Primary Tasks Breakdown

### EPIC 1: UI/UX and Frontend
- **TASK-1**: Create responsive home page and navigation.
- **TASK-2**: Build movie listing, search, and filters.
- **TASK-3**: Create movie details and showtime pages.

### EPIC 2: Authentication and Users
- **TASK-4**: Implement registration and login.
- **TASK-5**: Implement JWT authentication and protected routes.
- **TASK-6**: Create the user profile and dashboard.

### EPIC 3: Movie and Cinema Management
- **TASK-7**: Create movie database models and APIs.
- **TASK-8**: Implement cinema and screen management.
- **TASK-9**: Implement showtimes and pricing.

### EPIC 4: Booking and Seat Management
- **TASK-10**: Build the interactive seat selection interface.
- **TASK-11**: Implement server-side seat availability and conflict prevention.
- **TASK-12**: Implement booking creation, history, and cancellation.
- **TASK-13**: Implement simulated payment and ticket confirmation.

### EPIC 5: Administration and Project Workspace
- **TASK-14**: Build the admin dashboard.
- **TASK-15**: Implement secure movie, cinema, show, and user administration.
- **TASK-16**: Build the Overview, Workspace, and Kanban sections.

### EPIC 6: Testing, Deployment, and Documentation
- **TASK-17**: Write automated tests and fix application errors.
- **TASK-18**: Prepare deployment configuration and Demo/GitHub links.
- **TASK-19**: Create the README and final project documentation.

---

## 🛠️ Common Errors & Troubleshooting

### 1. `npm.ps1 cannot be loaded because running scripts is disabled`
**Solution**: Windows PowerShell restricts unsigned `.ps1` scripts by default. Always invoke **`npm.cmd`** (e.g. `npm.cmd run dev`) or adjust execution policy:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### 2. MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`)
**Solution**: Ensure the local Windows MongoDB service is running:
```powershell
Start-Service -Name MongoDB
```
Or provide a remote MongoDB Atlas URI in `server/.env`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/imovies_db
```

### 3. Port Conflicts (EADDRINUSE: port 5000)
**Solution**: If port 5000 is occupied, adjust `PORT=5001` in `server/.env` and `VITE_API_BASE_URL=http://localhost:5001/api` in `client/.env`.

---

## 📁 Repository File Structure

```
IMovies/
├── client/                     # Vite + React 19 Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # Navbar, Footer, MovieCard, ProtectedRoute
│   │   ├── context/            # AuthContext (state, JWT, alerts)
│   │   ├── pages/              # Home, Movies, Details, SeatSelection, Checkout, Confirm, Dashboard, Admin, Workspace
│   │   ├── services/           # Axios API service
│   │   ├── App.jsx             # React Router routing
│   │   ├── index.css           # Cinematic dark theme styling
│   │   └── main.jsx
│   └── package.json
├── server/                     # Express REST API Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection (db.js)
│   │   ├── controllers/        # Auth, Movie, Cinema, Show, Booking, Task, Admin
│   │   ├── middleware/         # JWT Protect, AuthorizeAdmin, ErrorHandler, Validators
│   │   ├── models/             # User, Movie, Cinema, Screen, Show, Booking, Payment, Task
│   │   ├── routes/             # Express API routes
│   │   ├── app.js              # Express app configuration
│   │   └── server.js           # Server listen entrypoint
│   ├── tests/                  # Automated integration tests (api.test.js)
│   └── package.json
├── scripts/                    # Seed script (seedData.js)
├── docs/                       # API.md, PROJECT_PLAN.md, SYSTEM_REQUIREMENTS.md
├── .env.example
├── .gitignore
├── package.json                # Root package orchestration
└── README.md
```

---

## 📄 License
This project is licensed under the ISC License.