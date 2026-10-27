const fs = require('fs');
const path = require('path');

const docsDir = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\docs';
fs.mkdirSync(docsDir, { recursive: true });

// 1. docs/API.md
const apiMd = `# IMovies — RESTful API Documentation

This document describes all API endpoints implemented in the IMovies application.
All requests requiring authentication must supply a JWT bearer token in the \`Authorization\` header:
\`\`\`
Authorization: Bearer <your_jwt_token>
\`\`\`

## Base URL
- Development: \`http://localhost:5000/api\`
- Production: \`https://<your-backend-domain>/api\`

---

## 1. Health Check
### \`GET /health\`
Returns system uptime, environment, and online status.
- **Access**: Public
- **Response**: \`200 OK\`
\`\`\`json
{
  "status": "online",
  "service": "IMovies REST API Server",
  "timestamp": "2026-10-27T18:40:00.000Z",
  "uptime": 124.5,
  "environment": "development"
}
\`\`\`

---

## 2. Authentication & Profile
### \`POST /auth/register\`
Register a new customer account.
- **Access**: Public
- **Body**:
\`\`\`json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "Password@123",
  "phone": "+91 9876543210"
}
\`\`\`
- **Response**: \`201 Created\` with user object and JWT token.

### \`POST /auth/login\`
Authenticate an existing customer or admin.
- **Access**: Public
- **Body**:
\`\`\`json
{
  "email": "demo@imovies.com",
  "password": "User@123password"
}
\`\`\`
- **Response**: \`200 OK\` with user object and JWT token.

### \`GET /auth/me\`
Retrieve current logged-in user details.
- **Access**: Protected (User / Admin)
- **Response**: \`200 OK\`

### \`PUT /auth/profile\`
Update user profile information.
- **Access**: Protected (User / Admin)
- **Body**: \`{ "name": "New Name", "phone": "+91 9876500000" }\`

### \`PUT /auth/change-password\`
Change current password.
- **Access**: Protected (User / Admin)
- **Body**: \`{ "currentPassword": "...", "newPassword": "..." }\`

---

## 3. Movies Catalog
### \`GET /movies\`
Filter and search movies with pagination and sorting.
- **Access**: Public
- **Query Parameters**:
  - \`search\`: text query (title, description, cast)
  - \`genre\`: 'Action', 'Sci-Fi', etc.
  - \`language\`: 'English', 'Hindi', etc.
  - \`status\`: 'now_showing', 'coming_soon'
  - \`sort\`: 'rating', 'popularity', 'releaseDate', 'title'
  - \`page\`: number (default: 1)
  - \`limit\`: number (default: 12)

### \`GET /movies/featured\`
Returns collections of featured, trending, now showing, and coming soon releases.
- **Access**: Public

### \`GET /movies/:id\`
Retrieve full movie details including upcoming shows count.
- **Access**: Public

### \`POST /movies\`
Create a new movie record.
- **Access**: Admin only

### \`DELETE /movies/:id\`
Delete a movie record.
- **Access**: Admin only

---

## 4. Cinemas & Screens
### \`GET /cinemas\`
List all partner cinemas, filterable by \`?city=Mumbai\`.
- **Access**: Public

### \`GET /cinemas/:id\`
Get cinema details including all auditorium screens.
- **Access**: Public

---

## 5. Showtimes & Seating
### \`GET /shows\`
List scheduled showtimes filtered by \`?movieId=...\`, \`?cinemaId=...\`, \`?date=YYYY-MM-DD\`.
- **Access**: Public

### \`GET /shows/:id\`
Get showtime details and complete real-time seat matrix with active hold expirations.
- **Access**: Public

### \`POST /shows\`
Schedule a new showtime and automatically generate seat layout with multi-tier pricing.
- **Access**: Admin only

---

## 6. Bookings & Concurrency-Safe Reservations
### \`POST /bookings/hold\`
Hold seats atomically for 5 minutes during checkout. Returns 409 Conflict if any seat is already booked or held by another customer.
- **Access**: Protected (User / Admin)
- **Body**:
\`\`\`json
{
  "showId": "6ae0daebb163e0235d67cfac",
  "seatIds": ["D4", "D5"]
}
\`\`\`

### \`POST /bookings\`
Complete booking and trigger simulated payment. Recalculates price on the server.
- **Access**: Protected (User / Admin)
- **Body**:
\`\`\`json
{
  "showId": "6ae0daebb163e0235d67cfac",
  "seatIds": ["D4", "D5"],
  "paymentMethod": "credit_card",
  "simulateOutcome": "success"
}
\`\`\`
*(Set \`simulateOutcome: "failure"\` to test simulated decline and automatic seat release.)*

### \`GET /bookings/my-bookings\`
Retrieve bookings belonging strictly to the authenticated user.
- **Access**: Protected (User / Admin)

### \`PUT /bookings/:id/cancel\`
Cancel a booking (allowed if showtime is > 2 hours away). Releases seats back to theater and creates simulated refund.
- **Access**: Protected (Owner / Admin)

---

## 7. Tasks & Kanban Board
### \`GET /tasks\`
Returns the 19 primary Kanban tasks across the 6 Epics.
- **Access**: Public

### \`GET /tasks/stats\`
Returns live stats breakdown (Total Epics: 6, Total Tasks: 19, Total Subtasks: 0, and column status counts).
- **Access**: Public

### \`PUT /tasks/:taskId\`
Updates task status ('Backlog', 'To Do', 'In Progress', 'Testing', 'Done').
- **Access**: Public / Admin

---

## 8. Admin Oversight
### \`GET /admin/stats\`
Returns KPI summary: totalRevenue, totalBookings, totalCancelled, popularMovies, and recent bookings.
- **Access**: Admin only

### \`GET /admin/users\`
List all registered users.
- **Access**: Admin only

### \`PUT /admin/users/:id/role\`
Toggle user role between 'user' and 'admin'.
- **Access**: Admin only
`;
fs.writeFileSync(path.join(docsDir, 'API.md'), apiMd.trim(), 'utf8');

// 2. docs/PROJECT_PLAN.md
const planMd = `# IMovies — Project Plan & Epic Breakdown

## Project Overview
- **Project Name**: IMovies — Movie Ticket Booking Made Simple
- **Category**: Entertainment
- **Project Type**: Individual
- **Developer Level**: Intermediate MERN Stack
- **Architecture**: Decoupled Client-Server (React Vite Frontend + Express REST Backend + MongoDB)

---

## Summary of Epics and Primary Tasks
- **Total Epics**: 6
- **Total Primary Tasks**: 19
- **Total Subtasks**: 0

### EPIC 1: UI/UX and Frontend
1. **TASK-1**: Create responsive home page and navigation.
2. **TASK-2**: Build movie listing, search, and filters.
3. **TASK-3**: Create movie details and showtime pages.

### EPIC 2: Authentication and Users
4. **TASK-4**: Implement registration and login.
5. **TASK-5**: Implement JWT authentication and protected routes.
6. **TASK-6**: Create the user profile and dashboard.

### EPIC 3: Movie and Cinema Management
7. **TASK-7**: Create movie database models and APIs.
8. **TASK-8**: Implement cinema and screen management.
9. **TASK-9**: Implement showtimes and pricing.

### EPIC 4: Booking and Seat Management
10. **TASK-10**: Build the interactive seat selection interface.
11. **TASK-11**: Implement server-side seat availability and conflict prevention.
12. **TASK-12**: Implement booking creation, history, and cancellation.
13. **TASK-13**: Implement simulated payment and ticket confirmation.

### EPIC 5: Administration and Project Workspace
14. **TASK-14**: Build the admin dashboard.
15. **TASK-15**: Implement secure movie, cinema, show, and user administration.
16. **TASK-16**: Build the Overview, Workspace, and Kanban sections.

### EPIC 6: Testing, Deployment, and Documentation
17. **TASK-17**: Write automated tests and fix application errors.
18. **TASK-18**: Prepare deployment configuration and Demo/GitHub links.
19. **TASK-19**: Create the README and final project documentation.

---

## Development Milestones
- **Milestone 1**: Project scoping, directory safety verification, scaffold MERN architecture. (Completed)
- **Milestone 2**: Database models, JWT authentication, and RESTful APIs. (Completed)
- **Milestone 3**: Interactive seat reservation engine with atomic hold and concurrency protection. (Completed)
- **Milestone 4**: Cinematic dark UI/UX frontend with responsive Bootstrap 5 and Lucide icons. (Completed)
- **Milestone 5**: Admin portal, analytics, and interactive 5-column Kanban board. (Completed)
- **Milestone 6**: Automated integration testing (15/15 passed) and comprehensive documentation. (Completed)
`;
fs.writeFileSync(path.join(docsDir, 'PROJECT_PLAN.md'), planMd.trim(), 'utf8');

// 3. docs/SYSTEM_REQUIREMENTS.md
const sysMd = `# IMovies — System Requirements & Troubleshooting Guide

## 1. Software Requirements
- **Operating System**: Windows 10/11, macOS, or Linux.
- **Node.js**: Node.js 20 LTS or Node.js 24 compatible runtime.
- **npm**: npm 10+ (use \`npm.cmd\` on Windows PowerShell if execution policies are restricted).
- **Database**: MongoDB Community Server 7.0+ or MongoDB Atlas connection string.
- **Web Browser**: Google Chrome 110+, Mozilla Firefox 110+, or Microsoft Edge.
- **Git**: Git 2.30+ for version control.
- **IDE**: Antigravity IDE or Visual Studio Code.
- **API Client**: Postman or Thunder Client (compatible with endpoints in \`docs/API.md\`).

## 2. Hardware Requirements
- **Processor**: Intel Core i5 8th Gen / AMD Ryzen 5 or higher.
- **RAM**: 8 GB minimum (16 GB recommended).
- **Disk Storage**: At least 1.5 GB free disk space for node_modules and builds.
- **Display Resolution**: 1366x768 minimum (1920x1080 recommended for cinema seat grid).

## 3. Common Troubleshooting Scenarios

### Problem A: PowerShell \`npm.ps1 cannot be loaded because running scripts is disabled\`
- **Cause**: Windows PowerShell Restricted execution policy.
- **Solution**: Call \`npm.cmd\` instead of \`npm\` in PowerShell, e.g.:
  \`\`\`powershell
  npm.cmd run dev
  npm.cmd install
  \`\`\`
  Or run: \`Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned\`.

### Problem B: MongoDB Connection Refused (\`ECONNREFUSED 127.0.0.1:27017\`)
- **Cause**: Local MongoDB service is stopped.
- **Solution**: Start the service in Windows PowerShell:
  \`\`\`powershell
  Start-Service -Name MongoDB
  \`\`\`
  Or check status with: \`Get-Service -Name MongoDB\`. Alternatively, supply a cloud MongoDB Atlas URI in \`server/.env\`.

### Problem C: Port Conflicts (Port 5000 or 5173 Already in Use)
- **Solution**:
  - For server: Change \`PORT=5001\` in \`server/.env\`.
  - For client: Vite automatically selects the next available port (e.g. 5174).

### Problem D: CORS Error on API Request
- **Solution**: Ensure \`CLIENT_URL=http://localhost:5173\` matches your frontend dev URL in \`server/.env\`. The server is configured to accept requests from \`localhost:5173\` and \`127.0.0.1:5173\`.
`;
fs.writeFileSync(path.join(docsDir, 'SYSTEM_REQUIREMENTS.md'), sysMd.trim(), 'utf8');

console.log('API.md, PROJECT_PLAN.md, and SYSTEM_REQUIREMENTS.md created successfully');
