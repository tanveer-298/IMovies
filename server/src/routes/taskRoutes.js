const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/', taskController.getTasks);
router.get('/stats', taskController.getStats);
router.put('/:taskId', taskController.updateTaskStatus);

module.exports = router;