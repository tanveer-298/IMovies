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
    const heldUntil = new Date(now.getTime() + HOLD_MINUTES * 60 * 1000);

    // Concurrency check: Ensure none of the requested seats are already booked or held by another active user
    const conflictingSeats = [];
    for (const seatId of seatIds) {
      const seat = show.seats.find(s => s.seatId === seatId);
      if (!seat) {
        return res.status(400).json({ success: false, message: `Seat ${seatId} does not exist in this show.` });
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
        seat.heldUntil = heldUntil;
      }
    });

    await show.save();

    res.status(200).json({
      success: true,
      message: `Seats successfully held for ${HOLD_MINUTES} minutes.`,
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
        return res.status(400).json({ success: false, message: `Seat ${seatId} does not exist.` });
      }
      if (seat.status === 'booked') {
        return res.status(409).json({ success: false, message: `Seat ${seatId} has already been booked.` });
      }
      // If held by someone else, or hold expired and claimed
      if (seat.status === 'held' && String(seat.heldBy) !== String(userId) && seat.heldUntil && new Date(seat.heldUntil) > now) {
        return res.status(409).json({ success: false, message: `Seat ${seatId} is held by another user.` });
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
    const showDateTime = new Date(`${booking.showId.date}T${booking.showId.startTime}`);
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