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

movieSchema.index({ title: 'text', description: 'text' }, { language_override: 'none' });

module.exports = mongoose.model('Movie', movieSchema);