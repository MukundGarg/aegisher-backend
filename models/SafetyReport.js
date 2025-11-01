// models/SafetyReport.js - Community safety reports model
const mongoose = require('mongoose');

const safetyReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'], // ✅ This "enum" is correct — inside an object
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String,
    placeName: String
  },
  safetyRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5 // 1 = very unsafe, 5 = very safe
  },
  reportType: {
    type: String,
    enum: [
      'lighting',
      'crowding',
      'incident',
      'harassment',   // ✅ added new type
      'unsafe area',  // ✅ added new type
      'general',
      'positive'
    ],
    default: 'general'
  },
  comment: {
    type: String,
    maxlength: 500
  },
  timeOfDay: {
    type: String,
    enum: ['morning', 'afternoon', 'evening', 'night'], // ✅ no TypeScript enums here
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  upvotes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
safetyReportSchema.index({ location: '2dsphere' });
safetyReportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SafetyReport', safetyReportSchema);