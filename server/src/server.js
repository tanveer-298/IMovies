require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

const server = app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🎬 IMovies Backend Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📽️  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION]:', err.message);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[IMovies Server] Gracefully shutting down...');
  server.close(() => {
    console.log('[IMovies Server] Process terminated.');
    process.exit(0);
  });
});