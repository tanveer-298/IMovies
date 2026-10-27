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