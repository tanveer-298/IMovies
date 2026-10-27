const fs = require('fs');
const path = require('path');

const serverDir = 'C:\\Users\\mansu\\.antigravity-ide\\IMovies\\server\\src';

function writeFile(relPath, content) {
  const fullPath = path.join(serverDir, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log('Created: ' + relPath);
}

// 1. config/db.js
writeFile('config/db.js', `
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies_db');
    console.log(\`[MongoDB] Connected successfully: \${conn.connection.host}/\${conn.connection.name}\`);
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
`);

// 2. models/User.js
writeFile('models/User.js', `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [60, 'Name cannot exceed 60 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
`);

// 3. models/Movie.js
writeFile('models/Movie.js', `
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Movie title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Movie description is required']
  },
  genre: [{
    type: String,
    trim: true
  }],
  language: [{
    type: String,
    trim: true
  }],
  duration: {
    type: Number,
    required: [true, 'Duration in minutes is required']
  },
  releaseDate: {
    type: Date,
    required: [true, 'Release date is required']
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 8.0
  },
  posterUrl: {
    type: String,
    required: [true, 'Poster image URL is required']
  },
  backdropUrl: {
    type: String,
    default: ''
  },
  trailerUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['now_showing', 'coming_soon', 'archived'],
    default: 'now_showing',
    index: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  director: {
    type: String,
    trim: true,
    default: 'Director TBA'
  },
  cast: [{
    type: String,
    trim: true
  }],
  ageRating: {
    type: String,
    enum: ['U', 'UA', 'A', 'PG-13', 'R'],
    default: 'UA'
  }
}, {
  timestamps: true
});

movieSchema.index({ title: 'text', description: 'text', genre: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
`);

// 4. models/Cinema.js
writeFile('models/Cinema.js', `
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
`);

// 5. models/Screen.js
writeFile('models/Screen.js', `
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
`);

// 6. models/Show.js
writeFile('models/Show.js', `
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
`);

// 7. models/Booking.js
writeFile('models/Booking.js', `
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingReference: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  showId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Show',
    required: true
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: true
  },
  cinemaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cinema',
    required: true
  },
  screenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Screen',
    required: true
  },
  seats: [{
    seatId: { type: String, required: true },
    row: { type: String, required: true },
    col: { type: Number, required: true },
    tier: { type: String, required: true },
    price: { type: Number, required: true }
  }],
  ticketSubtotal: {
    type: Number,
    required: true
  },
  convenienceFee: {
    type: Number,
    required: true,
    default: 30
  },
  tax: {
    type: Number,
    required: true,
    default: 18
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'confirmed',
    index: true
  },
  cancellationReason: {
    type: String,
    default: ''
  },
  qrCodeData: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
`);

// 8. models/Payment.js
writeFile('models/Payment.js', `
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
`);

// 9. models/Task.js (for Kanban)
writeFile('models/Task.js', `
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
`);

console.log('All 7 core models created successfully');
