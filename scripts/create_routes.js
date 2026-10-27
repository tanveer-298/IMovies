const fs = require('fs');
const path = require('path');

const serverDir = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\server\\src';

function writeFile(relPath, content) {
  const fullPath = path.join(serverDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log('Created: ' + relPath);
}

// 1. routes/authRoutes.js
writeFile('routes/authRoutes.js', `
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerValidation, loginValidation } = require('../middleware/validators');

router.post('/register', validate(registerValidation), authController.register);
router.post('/login', validate(loginValidation), authController.login);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
`);

// 2. routes/movieRoutes.js
writeFile('routes/movieRoutes.js', `
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.get('/', movieController.getMovies);
router.get('/featured', movieController.getFeaturedMovies);
router.get('/:id', movieController.getMovieById);
router.post('/', protect, authorizeAdmin, movieController.createMovie);
router.put('/:id', protect, authorizeAdmin, movieController.updateMovie);
router.delete('/:id', protect, authorizeAdmin, movieController.deleteMovie);

module.exports = router;
`);

// 3. routes/cinemaRoutes.js
writeFile('routes/cinemaRoutes.js', `
const express = require('express');
const router = express.Router();
const cinemaController = require('../controllers/cinemaController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.get('/', cinemaController.getCinemas);
router.get('/:id', cinemaController.getCinemaById);
router.post('/', protect, authorizeAdmin, cinemaController.createCinema);
router.put('/:id', protect, authorizeAdmin, cinemaController.updateCinema);
router.delete('/:id', protect, authorizeAdmin, cinemaController.deleteCinema);

module.exports = router;
`);

// 4. routes/showRoutes.js
writeFile('routes/showRoutes.js', `
const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.get('/', showController.getShows);
router.get('/:id', showController.getShowById);
router.post('/', protect, authorizeAdmin, showController.createShow);
router.delete('/:id', protect, authorizeAdmin, showController.deleteShow);

module.exports = router;
`);

// 5. routes/bookingRoutes.js
writeFile('routes/bookingRoutes.js', `
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/hold', protect, bookingController.holdSeats);
router.post('/release', protect, bookingController.releaseSeats);
router.post('/', protect, bookingController.createBooking);
router.get('/my-bookings', protect, bookingController.getUserBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.put('/:id/cancel', protect, bookingController.cancelBooking);

module.exports = router;
`);

// 6. routes/taskRoutes.js (Kanban)
writeFile('routes/taskRoutes.js', `
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getTasks);
router.get('/stats', taskController.getStats);
router.put('/:taskId', taskController.updateTaskStatus);

module.exports = router;
`);

// 7. routes/adminRoutes.js
writeFile('routes/adminRoutes.js', `
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.use(protect, authorizeAdmin);
router.get('/stats', adminController.getDashboardStats);
router.get('/bookings', adminController.getAllBookings);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);

module.exports = router;
`);

// 8. app.js
writeFile('app.js', `
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const cinemaRoutes = require('./routes/cinemaRoutes');
const showRoutes = require('./routes/showRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const taskRoutes = require('./routes/taskRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow during development & testing
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check Endpoint (Required by section 10 & 11)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: 'IMovies REST API Server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Requested API endpoint does not exist.' });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
`);

// 9. server.js
writeFile('server.js', `
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = app.listen(PORT, () => {
  console.log(\`===================================================\`);
  console.log(\`🎬 IMovies Backend Server running on port \${PORT}\`);
  console.log(\`📡 Health check: http://localhost:\${PORT}/api/health\`);
  console.log(\`📽️  Environment: \${process.env.NODE_ENV || 'development'}\`);
  console.log(\`===================================================\`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]:', err.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\\n[IMovies Server] Gracefully shutting down...');
  server.close(() => {
    console.log('[IMovies Server] Process terminated.');
    process.exit(0);
  });
});
`);

console.log('Routes, app.js and server.js generated successfully');
