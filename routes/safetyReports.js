// routes/safetyReports.js - Community Safety Reports API
const express = require('express');
const router = express.Router();
const SafetyReport = require('../models/SafetyReport');

// ==================================================
// POST /api/safety-reports - Submit a safety report
// ==================================================
router.post('/', async (req, res) => {
  try {
    const { userId, latitude, longitude, address, placeName, safetyRating, reportType, comment, timeOfDay } = req.body;

    if (!latitude || !longitude || !safetyRating || !timeOfDay) {
      return res.status(400).json({
        error: 'Missing required fields: latitude, longitude, safetyRating, timeOfDay'
      });
    }

    const report = new SafetyReport({
      userId: userId || null,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: address || 'Unknown location',
        placeName: placeName || ''
      },
      safetyRating,
      reportType: reportType || 'general',
      comment: comment || '',
      timeOfDay,
      verified: false
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Safety report submitted successfully',
      report
    });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({
      error: 'Failed to submit safety report',
      message: error.message
    });
  }
});

// ==================================================
// GET /api/safety-reports - Get all safety reports
// ==================================================
router.get('/', async (req, res) => {
  try {
    const reports = await SafetyReport.find().sort({ createdAt: -1 });
    res.json(reports); // frontend expects array
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      error: 'Failed to fetch reports',
      message: error.message
    });
  }
});

// ==================================================
// GET /api/safety-reports/nearby - Get reports near a location
// ==================================================
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const radiusInMeters = parseInt(radius) || 5000;
    const reports = await SafetyReport.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: radiusInMeters
        }
      }
    }).limit(50);

    res.json(reports);
  } catch (error) {
    console.error('Error fetching nearby reports:', error);
    res.status(500).json({ error: 'Failed to fetch nearby reports', message: error.message });
  }
});

module.exports = router;