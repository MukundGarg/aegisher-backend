// models/SOS.js - SOS Alert tracking model
const mongoose = require('mongoose');

const sosSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  triggerMethod: {
    type: String,
    enum: ['manual', 'voice', 'fall_detection', 'suspicious_motion'],
    default: 'manual'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active'
  },
  alertsSent: [{
    contactName: String,
    contactPhone: String,
    sentAt: Date,
    status: String // 'sent', 'failed', 'delivered'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
});

// Index for geospatial queries
sosSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOS', sosSchema);
