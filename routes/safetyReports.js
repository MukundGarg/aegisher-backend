// routes/safetyReports.js - Community safety reports routes
const express = require('express');
const router = express.Router();
const SafetyReport = require('../models/SafetyReport');

// POST /api/safety-reports/submit - Submit a safety report
router.post('/submit', async (req, res) => {
  try {
    const {
      userId,
      latitude,
      longitude,
      address,
      placeName,
      safetyRating,
      reportType,
      comment,
      timeOfDay
    } = req.body;

    if (!latitude || !longitude || !safetyRating || !timeOfDay) {
      return res.status(400).json({
        error: 'Missing required fields: latitude, longitude, safetyRating, timeOfDay'
      });
    }

    if (safetyRating < 1 || safetyRating > 5) {
      return res.status(400).json({
        error: 'Safety rating must be between 1 and 5'
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
      reportId: report._id,
      report
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to submit safety report',
      message: error.message
    });
  }
});

// GET /api/safety-reports/nearby - Get reports near a location
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const radiusInMeters = parseInt(radius) || 5000; // Default 5km

    const reports = await SafetyReport.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).limit(50).sort({ createdAt: -1 });

    const avgRating = reports.length > 0
      ? reports.reduce((sum, r) => sum + r.safetyRating, 0) / reports.length
      : 0;

    res.json({
      success: true,
      count: reports.length,
      averageSafetyRating: avgRating.toFixed(2),
      reports
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch nearby reports',
      message: error.message
    });
  }
});

// GET /api/safety-reports/:reportId - Get a specific report
router.get('/:reportId', async (req, res) => {
  try {
    const report = await SafetyReport.findById(req.params.reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      success: true,
      report
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch report',
      message: error.message
    });
  }
});

// PATCH /api/safety-reports/:reportId/upvote - Upvote a report
router.patch('/:reportId/upvote', async (req, res) => {
  try {
    const report = await SafetyReport.findByIdAndUpdate(
      req.params.reportId,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      success: true,
      message: 'Report upvoted',
      upvotes: report.upvotes
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to upvote report',
      message: error.message
    });
  }
});

// GET /api/safety-reports/stats/summary - Get safety statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalReports = await SafetyReport.countDocuments();
    
    const avgRatingResult = await SafetyReport.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$safetyRating' }
        }
      }
    ]);

    const reportsByType = await SafetyReport.aggregate([
      {
        $group: {
          _id: '$reportType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      statistics: {
        totalReports,
        averageSafetyRating: avgRatingResult[0]?.averageRating.toFixed(2) || 0,
        reportsByType
      }
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// ✅ Base route for health check (frontend connectivity test)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Safety Reports API is working!',
    availableEndpoints: [
      'POST /api/safety-reports/submit',
      'GET /api/safety-reports/nearby',
      'GET /api/safety-reports/:reportId',
      'PATCH /api/safety-reports/:reportId/upvote',
      'GET /api/safety-reports/stats/summary'
    ]
  });
});

module.exports = router;