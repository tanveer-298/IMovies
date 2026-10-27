const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  epic: {
    type: String,
    required: true,
    enum: [
      'EPIC 1: UI/UX and Frontend',
      'EPIC 2: Authentication and Users',
      'EPIC 3: Movie and Cinema Management',
      'EPIC 4: Booking and Seat Management',
      'EPIC 5: Administration and Project Workspace',
      'EPIC 6: Testing, Deployment, and Documentation'
    ]
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Backlog', 'To Do', 'In Progress', 'Testing', 'Done'],
    default: 'To Do',
    index: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);