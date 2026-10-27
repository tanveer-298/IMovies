const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  paymentReference: {
    type: String,
    required: true,
    unique: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'simulated_fast_pay'],
    default: 'simulated_fast_pay'
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending', 'refunded'],
    default: 'success'
  },
  isSimulated: {
    type: Boolean,
    default: true
  },
  transactionDetails: {
    cardLast4: { type: String, default: '4242' },
    gateway: { type: String, default: 'IMovies Simulated Gateway' },
    notes: { type: String, default: 'Test payment mode only - no actual charge' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);