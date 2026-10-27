const mongoose = require('mongoose');

const seatSubSchema = new mongoose.Schema({
  seatId: { type: String, required: true },
  row: { type: String, required: true },
  col: { type: Number, required: true },
  tier: { type: String, enum: ['Standard', 'Premium', 'VIP'], default: 'Standard' },
  price: { type: Number, required: true },
  status: { type: String, enum: ['available', 'held', 'booked'], default: 'available' },
  heldBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  heldUntil: { type: Date, default: null },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null }
}, { _id: false });

const showSchema = new mongoose.Schema({
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
    index: true
  },
  cinemaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    required: true,
    index: true
  },
  screenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true
  },
  date: {
    type: String,
    required: true,
    index: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ['2D', '3D', 'IMAX', '4DX', 'Dolby Cinema'],
    default: '2D'
  },
  language: {
    type: String,
    default: 'English'
  },
  basePrice: {
    type: Number,
    required: true,
    default: 250
  },
  seatTiers: [{
    tierName: { type: String, enum: ['Standard', 'Premium', 'VIP'] },
    price: { type: Number }
  }],
  seats: [seatSubSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

showSchema.index({ movieId: 1, cinemaId: 1, date: 1 });

module.exports = mongoose.model('Show', showSchema);