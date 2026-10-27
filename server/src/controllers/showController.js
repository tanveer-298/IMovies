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
          seatId: `${row}${col}`,
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