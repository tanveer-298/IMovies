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