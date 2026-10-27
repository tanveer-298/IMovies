# IMovies — RESTful API Documentation

This document describes all API endpoints implemented in the IMovies application.
All requests requiring authentication must supply a JWT bearer token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://<your-backend-domain>/api`

---

## 1. Health Check
### `GET /health`
Returns system uptime, environment, and online status.
- **Access**: Public
- **Response**: `200 OK`
```json
{
  "status": "online",
  "service": "IMovies REST API Server",
  "timestamp": "2026-10-27T18:40:00.000Z",
  "uptime": 124.5,
  "environment": "development"
}
```

---

## 2. Authentication & Profile
### `POST /auth/register`
Register a new customer account.
- **Access**: Public
- **Body**:
```json
{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "Password@123",
  "phone": "+91 9876543210"
}
```
- **Response**: `201 Created` with user object and JWT token.

### `POST /auth/login`
Authenticate an existing customer or admin.
- **Access**: Public
- **Body**:
```json
{
  "email": "demo@imovies.com",
  "password": "User@123password"
}
```
- **Response**: `200 OK` with user object and JWT token.

### `GET /auth/me`
Retrieve current logged-in user details.
- **Access**: Protected (User / Admin)
- **Response**: `200 OK`

### `PUT /auth/profile`
Update user profile information.
- **Access**: Protected (User / Admin)
- **Body**: `{ "name": "New Name", "phone": "+91 9876500000" }`

### `PUT /auth/change-password`
Change current password.
- **Access**: Protected (User / Admin)
- **Body**: `{ "currentPassword": "...", "newPassword": "..." }`

---

## 3. Movies Catalog
### `GET /movies`
Filter and search movies with pagination and sorting.
- **Access**: Public
- **Query Parameters**:
  - `search`: text query (title, description, cast)
  - `genre`: 'Action', 'Sci-Fi', etc.
  - `language`: 'English', 'Hindi', etc.
  - `status`: 'now_showing', 'coming_soon'
  - `sort`: 'rating', 'popularity', 'releaseDate', 'title'
  - `page`: number (default: 1)
  - `limit`: number (default: 12)

### `GET /movies/featured`
Returns collections of featured, trending, now showing, and coming soon releases.
- **Access**: Public

### `GET /movies/:id`
Retrieve full movie details including upcoming shows count.
- **Access**: Public

### `POST /movies`
Create a new movie record.
- **Access**: Admin only

### `DELETE /movies/:id`
Delete a movie record.
- **Access**: Admin only

---

## 4. Cinemas & Screens
### `GET /cinemas`
List all partner cinemas, filterable by `?city=Mumbai`.
- **Access**: Public

### `GET /cinemas/:id`
Get cinema details including all auditorium screens.
- **Access**: Public

---

## 5. Showtimes & Seating
### `GET /shows`
List scheduled showtimes filtered by `?movieId=...`, `?cinemaId=...`, `?date=YYYY-MM-DD`.
- **Access**: Public

### `GET /shows/:id`
Get showtime details and complete real-time seat matrix with active hold expirations.
- **Access**: Public

### `POST /shows`
Schedule a new showtime and automatically generate seat layout with multi-tier pricing.
- **Access**: Admin only

---

## 6. Bookings & Concurrency-Safe Reservations
### `POST /bookings/hold`
Hold seats atomically for 5 minutes during checkout. Returns 409 Conflict if any seat is already booked or held by another customer.
- **Access**: Protected (User / Admin)
- **Body**:
```json
{
  "showId": "6ae0daebb163e0235d67cfac",
  "seatIds": ["D4", "D5"]
}
```

### `POST /bookings`
Complete booking and trigger simulated payment. Recalculates price on the server.
- **Access**: Protected (User / Admin)
- **Body**:
```json
{
  "showId": "6ae0daebb163e0235d67cfac",
  "seatIds": ["D4", "D5"],
  "paymentMethod": "credit_card",
  "simulateOutcome": "success"
}
```
*(Set `simulateOutcome: "failure"` to test simulated decline and automatic seat release.)*

### `GET /bookings/my-bookings`
Retrieve bookings belonging strictly to the authenticated user.
- **Access**: Protected (User / Admin)

### `PUT /bookings/:id/cancel`
Cancel a booking (allowed if showtime is > 2 hours away). Releases seats back to theater and creates simulated refund.
- **Access**: Protected (Owner / Admin)

---

## 7. Tasks & Kanban Board
### `GET /tasks`
Returns the 19 primary Kanban tasks across the 6 Epics.
- **Access**: Public

### `GET /tasks/stats`
Returns live stats breakdown (Total Epics: 6, Total Tasks: 19, Total Subtasks: 0, and column status counts).
- **Access**: Public

### `PUT /tasks/:taskId`
Updates task status ('Backlog', 'To Do', 'In Progress', 'Testing', 'Done').
- **Access**: Public / Admin

---

## 8. Admin Oversight
### `GET /admin/stats`
Returns KPI summary: totalRevenue, totalBookings, totalCancelled, popularMovies, and recent bookings.
- **Access**: Admin only

### `GET /admin/users`
List all registered users.
- **Access**: Admin only

### `PUT /admin/users/:id/role`
Toggle user role between 'user' and 'admin'.
- **Access**: Admin only