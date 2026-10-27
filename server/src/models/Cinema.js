const mongoose = require('mongoose');

const cinemaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cinema name is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    index: true
  },
  location: {
    type: String,
    required: [true, 'Location / Mall name is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 4.5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Cinema', cinemaSchema);