const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.get('/', showController.getShows);
router.get('/:id', showController.getShowById);
router.post('/', protect, authorizeAdmin, showController.createShow);
router.delete('/:id', protect, authorizeAdmin, showController.deleteShow);

module.exports = router;