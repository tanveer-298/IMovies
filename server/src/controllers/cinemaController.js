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