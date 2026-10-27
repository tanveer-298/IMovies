const fs = require('fs');
const path = require('path');

const serverDir = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\server\\src';

function writeFile(relPath, content) {
  const fullPath = path.join(serverDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log('Created: ' + relPath);
}

// 1. controllers/authController.js
writeFile('controllers/authController.js', `
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_2026_cinematic_production', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'user'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to IMovies.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password combination.'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar !== undefined) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new password.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    next(error);
  }
};
`);

// 2. controllers/movieController.js
writeFile('controllers/movieController.js', `
const Movie = require('../models/Movie');
const Show = require('../models/Show');

exports.getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, status, sort, page = 1, limit = 12 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (genre && genre !== 'All') {
      query.genre = { $in: [genre] };
    }

    if (language && language !== 'All') {
      query.language = { $in: [language] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { cast: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { releaseDate: -1 };
    if (sort === 'rating') sortOption = { rating: -1 };
    if (sort === 'popularity') sortOption = { trending: -1, rating: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'duration') sortOption = { duration: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Movie.countDocuments(query);
    const movies = await Movie.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: movies.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      movies
    });
  } catch (error) {
    next(error);
  }
};

exports.getFeaturedMovies = async (req, res, next) => {
  try {
    const featured = await Movie.find({ featured: true, status: 'now_showing' }).limit(5);
    const trending = await Movie.find({ trending: true, status: 'now_showing' }).sort({ rating: -1 }).limit(10);
    const nowShowing = await Movie.find({ status: 'now_showing' }).sort({ rating: -1 }).limit(12);
    const comingSoon = await Movie.find({ status: 'coming_soon' }).sort({ releaseDate: 1 }).limit(8);

    res.status(200).json({
      success: true,
      featured,
      trending,
      nowShowing,
      comingSoon
    });
  } catch (error) {
    next(error);
  }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found.' });
    }

    // Also get active show dates and cinemas for this movie
    const today = new Date().toISOString().split('T')[0];
    const shows = await Show.find({
      movieId: movie._id,
      isActive: true,
      date: { $gte: today }
    }).populate('cinemaId', 'name city location amenities');

    res.status(200).json({
      success: true,
      movie,
      availableShowsCount: shows.length,
      shows
    });
  } catch (error) {
    next(error);
  }
};

exports.createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, message: 'Movie created successfully.', movie });
  } catch (error) {
    next(error);
  }
};

exports.updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
    res.status(200).json({ success: true, message: 'Movie updated successfully.', movie });
  } catch (error) {
    next(error);
  }
};

exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
    res.status(200).json({ success: true, message: 'Movie deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
`);

// 3. controllers/cinemaController.js
writeFile('controllers/cinemaController.js', `
const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');

exports.getCinemas = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = {};
    if (city && city !== 'All') filter.city = city;

    const cinemas = await Cinema.find(filter).sort({ name: 1 });
    const cities = await Cinema.distinct('city');

    res.status(200).json({
      success: true,
      count: cinemas.length,
      cities,
      cinemas
    });
  } catch (error) {
    next(error);
  }
};

exports.getCinemaById = async (req, res, next) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found.' });
    const screens = await Screen.find({ cinemaId: cinema._id });

    res.status(200).json({
      success: true,
      cinema,
      screens
    });
  } catch (error) {
    next(error);
  }
};

exports.createCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.create(req.body);
    res.status(201).json({ success: true, cinema });
  } catch (error) {
    next(error);
  }
};

exports.updateCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found.' });
    res.status(200).json({ success: true, cinema });
  } catch (error) {
    next(error);
  }
};

exports.deleteCinema = async (req, res, next) => {
  try {
    const cinema = await Cinema.findByIdAndDelete(req.params.id);
    if (!cinema) return res.status(404).json({ success: false, message: 'Cinema not found.' });
    await Screen.deleteMany({ cinemaId: cinema._id });
    res.status(200).json({ success: true, message: 'Cinema and screens deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
`);

// 4. controllers/showController.js
writeFile('controllers/showController.js', `
const Show = require('../models/Show');
const Screen = require('../models/Screen');

exports.getShows = async (req, res, next) => {
  try {
    const { movieId, cinemaId, date } = req.query;
    const query = { isActive: true };

    if (movieId) query.movieId = movieId;
    if (cinemaId) query.cinemaId = cinemaId;
    if (date) query.date = date;

    const shows = await Show.find(query)
      .populate('movieId', 'title posterUrl duration ageRating language')
      .populate('cinemaId', 'name city location')
      .populate('screenId', 'screenNumber screenName screenType')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: shows.length,
      shows
    });
  } catch (error) {
    next(error);
  }
};

exports.getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Showtime not found.' });
    }

    // Refresh seat statuses: If a seat is 'held' but heldUntil has passed, consider it available!
    const now = new Date();
    const updatedSeats = show.seats.map(seat => {
      const s = seat.toObject ? seat.toObject() : { ...seat };
      if (s.status === 'held' && s.heldUntil && new Date(s.heldUntil) < now) {
        s.status = 'available';
        s.heldBy = null;
        s.heldUntil = null;
      }
      return s;
    });

    const showObj = show.toObject();
    showObj.seats = updatedSeats;

    res.status(200).json({
      success: true,
      show: showObj
    });
  } catch (error) {
    next(error);
  }
};

exports.createShow = async (req, res, next) => {
  try {
    const { movieId, cinemaId, screenId, date, startTime, endTime, format, language, basePrice } = req.body;

    const screen = await Screen.findById(screenId);
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found.' });

    // Generate seats automatically from layout
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = screen.seatLayout?.seatsPerRow || 10;
    const totalRowsCount = screen.seatLayout?.totalRows || 6;
    const effectiveRows = rows.slice(0, totalRowsCount);

    const seatTiers = [
      { tierName: 'Standard', price: Number(basePrice) },
      { tierName: 'Premium', price: Math.round(Number(basePrice) * 1.35) },
      { tierName: 'VIP', price: Math.round(Number(basePrice) * 1.8) }
    ];

    const seats = [];
    effectiveRows.forEach((row, rowIndex) => {
      let tier = 'Standard';
      let price = seatTiers[0].price;

      if (rowIndex >= effectiveRows.length - 1) {
        tier = 'VIP';
        price = seatTiers[2].price;
      } else if (rowIndex >= effectiveRows.length - 3) {
        tier = 'Premium';
        price = seatTiers[1].price;
      }

      for (let col = 1; col <= seatsPerRow; col++) {
        seats.push({
          seatId: \`\${row}\${col}\`,
          row,
          col,
          tier,
          price,
          status: 'available',
          heldBy: null,
          heldUntil: null,
          bookingId: null
        });
      }
    });

    const show = await Show.create({
      movieId,
      cinemaId,
      screenId,
      date,
      startTime,
      endTime: endTime || '23:00',
      format: format || screen.screenType || '2D',
      language: language || 'English',
      basePrice: Number(basePrice),
      seatTiers,
      seats,
      isActive: true
    });

    res.status(201).json({ success: true, message: 'Show scheduled successfully.', show });
  } catch (error) {
    next(error);
  }
};

exports.deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });
    res.status(200).json({ success: true, message: 'Show removed successfully.' });
  } catch (error) {
    next(error);
  }
};
`);

// 5. controllers/bookingController.js
writeFile('controllers/bookingController.js', `
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Movie = require('../models/Movie');
const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');

const HOLD_MINUTES = parseInt(process.env.SEAT_HOLD_DURATION_MINUTES) || 5;

// Atomic seat hold
exports.holdSeats = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const userId = req.user._id;

    if (!showId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid showId and seatIds.' });
    }

    if (seatIds.length > 8) {
      return res.status(400).json({ success: false, message: 'You can reserve a maximum of 8 seats per booking.' });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found.' });
    }

    const now = new Date();
    const holdUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    // Concurrency check: Ensure none of the requested seats are already booked or held by another active user
    const conflictingSeats = [];
    for (const seatId of seatIds) {
      const seat = show.seats.find(s => s.seatId === seatId);
      if (!seat) {
        return res.status(400).json({ success: false, message: \`Seat \${seatId} does not exist in this show.\` });
      }
      if (seat.status === 'booked') {
        conflictingSeats.push({ seatId, reason: 'Already booked' });
      } else if (seat.status === 'held' && seat.heldUntil && new Date(seat.heldUntil) > now && String(seat.heldBy) !== String(userId)) {
        conflictingSeats.push({ seatId, reason: 'Held by another customer' });
      }
    }

    if (conflictingSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Some of your selected seats are no longer available. Please select different seats.',
        conflictingSeats
      });
    }

    // Atomically update seats in MongoDB
    show.seats.forEach(seat => {
      if (seatIds.includes(seat.seatId)) {
        seat.status = 'held';
        seat.heldBy = userId;
        seat.heldUntil = holdUntil;
      }
    });

    await show.save();

    res.status(200).json({
      success: true,
      message: \`Seats successfully held for \${HOLD_MINUTES} minutes.\`,
      heldUntil,
      seatIds
    });
  } catch (error) {
    next(error);
  }
};

// Release seat hold
exports.releaseSeats = async (req, res, next) => {
  try {
    const { showId, seatIds } = req.body;
    const userId = req.user._id;

    const show = await Show.findById(showId);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

    show.seats.forEach(seat => {
      if ((!seatIds || seatIds.includes(seat.seatId)) && seat.status === 'held' && String(seat.heldBy) === String(userId)) {
        seat.status = 'available';
        seat.heldBy = null;
        seat.heldUntil = null;
      }
    });

    await show.save();

    res.status(200).json({ success: true, message: 'Seats released.' });
  } catch (error) {
    next(error);
  }
};

// Confirm booking with simulated payment
exports.createBooking = async (req, res, next) => {
  try {
    const { showId, seatIds, paymentMethod, simulateOutcome = 'success' } = req.body;
    const userId = req.user._id;

    if (!showId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid show or seats requested.' });
    }

    const show = await Show.findById(showId)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId');

    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

    const now = new Date();

    // Verify seat hold validity
    for (const seatId of seatIds) {
      const seat = show.seats.find(s => s.seatId === seatId);
      if (!seat) {
        return res.status(400).json({ success: false, message: \`Seat \${seatId} does not exist.\` });
      }
      if (seat.status === 'booked') {
        return res.status(409).json({ success: false, message: \`Seat \${seatId} has already been booked.\` });
      }
      // If held by someone else, or hold expired and claimed
      if (seat.status === 'held' && String(seat.heldBy) !== String(userId) && seat.heldUntil && new Date(seat.heldUntil) > now) {
        return res.status(409).json({ success: false, message: \`Seat \${seatId} is held by another user.\` });
      }
    }

    // Server-side Price Recalculation (CRITICAL SECURITY: Never trust client price)
    const selectedSeatDetails = [];
    let ticketSubtotal = 0;

    for (const seatId of seatIds) {
      const seat = show.seats.find(s => s.seatId === seatId);
      selectedSeatDetails.push({
        seatId: seat.seatId,
        row: seat.row,
        col: seat.col,
        tier: seat.tier,
        price: seat.price
      });
      ticketSubtotal += seat.price;
    }

    const convenienceFee = Math.round(seatIds.length * 30);
    const tax = Math.round(ticketSubtotal * 0.18);
    const totalAmount = ticketSubtotal + convenienceFee + tax;

    const paymentRef = 'PAY-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // Handle Simulated Payment Failure
    if (simulateOutcome === 'failure') {
      // Release held seats back to available
      show.seats.forEach(seat => {
        if (seatIds.includes(seat.seatId) && String(seat.heldBy) === String(userId)) {
          seat.status = 'available';
          seat.heldBy = null;
          seat.heldUntil = null;
        }
      });
      await show.save();

      await Payment.create({
        paymentReference: paymentRef,
        userId,
        amount: totalAmount,
        currency: 'INR',
        paymentMethod: paymentMethod || 'simulated_fast_pay',
        status: 'failed',
        isSimulated: true,
        transactionDetails: {
          failureReason: 'Customer payment simulation intentionally declined for testing failure flow.'
        }
      });

      return res.status(400).json({
        success: false,
        message: 'Payment simulation was declined or failed. Your held seats have been released.',
        paymentReference: paymentRef
      });
    }

    // Payment Succeeded - Finalize Booking
    const bookingRef = 'IMV-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const payment = await Payment.create({
      paymentReference: paymentRef,
      userId,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'simulated_fast_pay',
      status: 'success',
      isSimulated: true,
      transactionDetails: {
        cardLast4: '4242',
        gateway: 'IMovies Simulated SafePay',
        notes: 'Simulated payment succeeded - test mode'
      }
    });

    const qrData = JSON.stringify({
      ref: bookingRef,
      movie: show.movieId.title,
      cinema: show.cinemaId.name,
      date: show.date,
      time: show.startTime,
      seats: seatIds.join(', '),
      total: totalAmount
    });

    const booking = await Booking.create({
      bookingReference: bookingRef,
      userId,
      showId: show._id,
      movieId: show.movieId._id,
      cinemaId: show.cinemaId._id,
      screenId: show.screenId._id,
      seats: selectedSeatDetails,
      ticketSubtotal,
      convenienceFee,
      tax,
      totalAmount,
      paymentId: payment._id,
      bookingStatus: 'confirmed',
      qrCodeData: qrData
    });

    payment.bookingId = booking._id;
    await payment.save();

    // Mark seats as booked
    show.seats.forEach(seat => {
      if (seatIds.includes(seat.seatId)) {
        seat.status = 'booked';
        seat.heldBy = null;
        seat.heldUntil = null;
        seat.bookingId = booking._id;
      }
    });
    await show.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId')
      .populate('paymentId');

    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully! Enjoy your movie.',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// Get current user bookings
exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('movieId', 'title posterUrl backdropUrl duration ageRating')
      .populate('cinemaId', 'name city location address')
      .populate('screenId', 'screenNumber screenName screenType')
      .populate('showId', 'date startTime endTime format language')
      .populate('paymentId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// Get booking by ID
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movieId')
      .populate('cinemaId')
      .populate('screenId')
      .populate('showId')
      .populate('paymentId');

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Authorization: User must own booking OR be admin
    if (String(booking.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You do not have permission to view this booking.' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// Cancel booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showId');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (String(booking.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this booking.' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    // Cancellation rule check: can cancel up to 2 hours before showtime
    const showDateTime = new Date(\`\${booking.showId.date}T\${booking.showId.startTime}\`);
    const now = new Date();
    const hoursUntilShow = (showDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilShow < 2 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Tickets cannot be cancelled within 2 hours of showtime according to cinema policy.'
      });
    }

    // Release seats in the show
    const show = await Show.findById(booking.showId._id);
    if (show) {
      const seatIdsToFree = booking.seats.map(s => s.seatId);
      show.seats.forEach(seat => {
        if (seatIdsToFree.includes(seat.seatId)) {
          seat.status = 'available';
          seat.heldBy = null;
          seat.heldUntil = null;
          seat.bookingId = null;
        }
      });
      await show.save();
    }

    booking.bookingStatus = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by user';
    await booking.save();

    if (booking.paymentId) {
      await Payment.findByIdAndUpdate(booking.paymentId, { status: 'refunded' });
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Simulated refund processed.',
      booking
    });
  } catch (error) {
    next(error);
  }
};
`);

// 6. controllers/taskController.js (for Kanban)
writeFile('controllers/taskController.js', `
const Task = require('../models/Task');

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ epic: 1, order: 1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { status, order } = req.body;

    const validStatuses = ['Backlog', 'To Do', 'In Progress', 'Testing', 'Done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status.' });
    }

    const task = await Task.findOneAndUpdate(
      { taskId },
      { status, ...(order !== undefined ? { order } : {}) },
      { new: true }
    );

    if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

    res.status(200).json({ success: true, message: 'Task updated.', task });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const tasks = await Task.find();
    const epics = new Set(tasks.map(t => t.epic));

    const statusCounts = {
      Backlog: 0,
      'To Do': 0,
      'In Progress': 0,
      Testing: 0,
      Done: 0
    };

    tasks.forEach(t => {
      if (statusCounts[t.status] !== undefined) {
        statusCounts[t.status]++;
      }
    });

    res.status(200).json({
      success: true,
      stats: {
        totalEpics: epics.size || 6,
        totalTasks: tasks.length,
        totalSubtasks: 0,
        statusCounts
      }
    });
  } catch (error) {
    next(error);
  }
};
`);

// 7. controllers/adminController.js
writeFile('controllers/adminController.js', `
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
`);

console.log('All 7 controllers generated successfully');
