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