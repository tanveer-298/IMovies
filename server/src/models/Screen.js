const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema({
  cinemaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    required: true,
    index: true
  },
  screenNumber: {
    type: Number,
    required: true
  },
  screenName: {
    type: String,
    required: true,
    trim: true
  },
  screenType: {
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby Cinema'],
    default: '2D'
  },
  capacity: {
    type: Number,
    default: 60
  },
  seatLayout: {
    totalRows: { type: Number, default: 6 },
    seatsPerRow: { type: Number, default: 10 },
    tiers: [{
      tierName: { type: String, enum: ['Standard', 'Premium', 'VIP'], default: 'Standard' },
      priceMultiplier: { type: Number, default: 1 },
      rowStart: { type: String, default: 'A' },
      rowEnd: { type: String, default: 'F' }
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Screen', screenSchema);