const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const User = require('../models/User');
const Payment = require('../models/Payment');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalBookings = await Booking.countDocuments({ bookingStatus: 'confirmed' });
    const totalCancelled = await Booking.countDocuments({ bookingStatus: 'cancelled' });
    const totalMovies = await Movie.countDocuments();
    const totalCinemas = await Cinema.countDocuments();
    const totalUsers = await User.countDocuments();

    // Aggregate confirmed payments revenue
    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Recent 10 bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('movieId', 'title posterUrl')
      .populate('cinemaId', 'name city')
      .populate('showId', 'date startTime')
      .sort({ createdAt: -1 })
      .limit(10);

    // Revenue by movie
    const movieRevenue = await Booking.aggregate([
      { $match: { bookingStatus: 'confirmed' } },
      {
        $group: {
          _id: '$movieId',
          revenue: { $sum: '$totalAmount' },
          bookingsCount: { $sum: 1 },
          seatsSold: { $sum: { $size: '$seats' } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    await Movie.populate(movieRevenue, { path: '_id', select: 'title posterUrl' });

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings,
        totalCancelled,
        totalMovies,
        totalCinemas,
        totalUsers,
        recentBookings,
        popularMovies: movieRevenue
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.bookingStatus = status;
    if (search) filter.bookingReference = { $regex: search, $options: 'i' };

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate('movieId', 'title posterUrl')
      .populate('cinemaId', 'name city')
      .populate('showId', 'date startTime')
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'User role updated.', user });
  } catch (error) {
    next(error);
  }
};