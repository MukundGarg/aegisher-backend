// routes/dangerPrediction.js - AI danger level prediction (mock implementation)
const express = require('express');
const router = express.Router();
const SafetyReport = require('../models/SafetyReport');
const SOS = require('../models/SOS');

// Helper function to calculate danger score based on various factors
const calculateDangerScore = async (latitude, longitude, timeOfDay) => {
  try {
    // Get recent safety reports within 2km
    const nearbyReports = await SafetyReport.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 2000 // 2km
        }
      }
    }).limit(20);

    // Get recent SOS alerts within 5km
    const recentSOSAlerts = await SOS.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: 5000 // 5km
        }
      },
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    });

    // Calculate base danger score
    let dangerScore = 3; // Start neutral

    // Factor 1: Average safety rating from community
    if (nearbyReports.length > 0) {
      const avgSafetyRating = nearbyReports.reduce((sum, r) => sum + r.safetyRating, 0) / nearbyReports.length;
      dangerScore = 6 - avgSafetyRating; // Inverse (5 safety = 1 danger, 1 safety = 5 danger)
    }

    // Factor 2: Recent SOS activity
    if (recentSOSAlerts.length > 0) {
      dangerScore += Math.min(recentSOSAlerts.length * 0.3, 1.5); // Up to +1.5
    }

    // Factor 3: Time of day
    const timeFactors = {
      'morning': -0.5,   // Safer
      'afternoon': -0.3,
      'evening': 0.3,
      'night': 1.0       // More dangerous
    };
    dangerScore += timeFactors[timeOfDay] || 0;

    // Factor 4: Random variation for crowd density (simulated)
    const crowdFactor = Math.random() * 0.5 - 0.25;
    dangerScore += crowdFactor;

    // Clamp between 1 and 5
    dangerScore = Math.max(1, Math.min(5, dangerScore));

    // Determine danger level
    let dangerLevel;
    if (dangerScore <= 1.5) dangerLevel = 'Very Safe';
    else if (dangerScore <= 2.5) dangerLevel = 'Safe';
    else if (dangerScore <= 3.5) dangerLevel = 'Moderate';
    else if (dangerScore <= 4.5) dangerLevel = 'Unsafe';
    else dangerLevel = 'Very Unsafe';

    // Generate AI factors
    const factors = [];
    
    if (nearbyReports.length > 0) {
      factors.push({
        factor: 'Community Reports',
        impact: nearbyReports.length > 10 ? 'High' : 'Medium',
        description: `${nearbyReports.length} safety reports in area`
      });
    }

    if (recentSOSAlerts.length > 0) {
      factors.push({
        factor: 'Recent SOS Alerts',
        impact: 'High',
        description: `${recentSOSAlerts.length} emergency alerts in past week`
      });
    }

    factors.push({
      factor: 'Time of Day',
      impact: timeOfDay === 'night' ? 'High' : 'Low',
      description: `${timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)} hours`
    });

    factors.push({
      factor: 'Crowd Density',
      impact: 'Medium',
      description: crowdFactor > 0 ? 'Low footfall detected' : 'Good crowd presence'
    });

    return {
      dangerScore: dangerScore.toFixed(1),
      dangerLevel,
      factors,
      reportsAnalyzed: nearbyReports.length,
      sosAlertsNearby: recentSOSAlerts.length
    };

  } catch (error) {
    console.error('Error calculating danger score:', error);
    // Return neutral score on error
    return {
      dangerScore: '3.0',
      dangerLevel: 'Moderate',
      factors: [
        {
          factor: 'Insufficient Data',
          impact: 'Medium',
          description: 'Using baseline prediction'
        }
      ],
      reportsAnalyzed: 0,
      sosAlertsNearby: 0
    };
  }
};

// POST /api/danger-prediction/analyze - Get AI danger prediction
router.post('/analyze', async (req, res) => {
  try {
    const { latitude, longitude, timeOfDay } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: 'Latitude and longitude are required'
      });
    }

    const currentTime = timeOfDay || 'evening';

    const prediction = await calculateDangerScore(
      parseFloat(latitude),
      parseFloat(longitude),
      currentTime
    );

    // Generate recommendations
    const recommendations = [];
    
    if (parseFloat(prediction.dangerScore) >= 4) {
      recommendations.push('Avoid traveling alone in this area');
      recommendations.push('Consider using safe route alternative');
      recommendations.push('Share live location with trusted contacts');
    } else if (parseFloat(prediction.dangerScore) >= 3) {
      recommendations.push('Stay alert in this area');
      recommendations.push('Keep emergency contacts ready');
    } else {
      recommendations.push('Area appears safe');
      recommendations.push('Continue normal precautions');
    }

    res.json({
      success: true,
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      timestamp: new Date(),
      prediction: {
        ...prediction,
        recommendations
      },
      aiModel: 'AegiSher AI v1.0 (Mock)',
      confidenceLevel: '85%'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to analyze danger level',
      message: error.message
    });
  }
});

// GET /api/danger-prediction/heatmap - Get danger heatmap data
router.get('/heatmap', async (req, res) => {
  try {
    const { centerLat, centerLng, radius } = req.query;

    if (!centerLat || !centerLng) {
      return res.status(400).json({
        error: 'Center latitude and longitude are required'
      });
    }

    const radiusInMeters = parseInt(radius) || 10000; // Default 10km

    // Generate grid points for heatmap
    const gridSize = 5; // 5x5 grid
    const step = 0.01; // Approx 1km
    const heatmapData = [];

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const lat = parseFloat(centerLat) + (i * step);
        const lng = parseFloat(centerLng) + (j * step);

        const danger = await calculateDangerScore(lat, lng, 'evening');

        heatmapData.push({
          lat,
          lng,
          intensity: parseFloat(danger.dangerScore) / 5, // Normalize to 0-1
          dangerLevel: danger.dangerLevel
        });
      }
    }

    res.json({
      success: true,
      gridSize: `${gridSize * 2 + 1}x${gridSize * 2 + 1}`,
      center: {
        lat: parseFloat(centerLat),
        lng: parseFloat(centerLng)
      },
      radius: radiusInMeters,
      heatmapData
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate heatmap',
      message: error.message
    });
  }
});

/* 
 * TODO: INTEGRATE REAL AI MODEL
 * 
 * To implement actual AI predictions:
 * 1. Train ML model using TensorFlow/PyTorch with features:
 *    - Historical crime data
 *    - Time series patterns
 *    - Weather conditions
 *    - Population density
 *    - Street lighting data
 *    - Police presence
 * 
 * 2. Use Python backend with Flask/FastAPI for ML inference
 * 3. Call Python API from this Node.js route
 * 4. Example: axios.post('http://localhost:8000/predict', data)
 * 
 * 5. Or use cloud ML services:
 *    - AWS SageMaker
 *    - Google AI Platform
 *    - Azure ML
 */

module.exports = router;
