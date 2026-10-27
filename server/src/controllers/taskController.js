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