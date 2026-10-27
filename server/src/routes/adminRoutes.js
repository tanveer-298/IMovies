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