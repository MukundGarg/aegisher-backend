// routes/routes.js - Safe route suggestions (mock implementation)
const express = require('express');
const router = express.Router();

// Helper function to calculate mock route data
const generateRouteData = (startLat, startLng, endLat, endLng, routeType) => {
  // Calculate rough distance (simplified)
  const distance = Math.sqrt(
    Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2)
  ) * 111; // Approx km

  const baseTime = distance * 12; // Base time in minutes

  if (routeType === 'safe') {
    return {
      type: 'safe',
      distance: (distance * 1.15).toFixed(2) + ' km', // 15% longer
      duration: Math.round(baseTime * 1.2) + ' mins', // 20% more time
      safetyScore: (Math.random() * 1 + 4).toFixed(1), // 4.0 - 5.0
      dangerZonesAvoided: Math.floor(Math.random() * 3) + 1,
      features: [
        'Well-lit streets',
        'High footfall area',
        'Police stations nearby',
        'CCTV coverage'
      ],
      warnings: []
    };
  } else {
    return {
      type: 'normal',
      distance: distance.toFixed(2) + ' km',
      duration: Math.round(baseTime) + ' mins',
      safetyScore: (Math.random() * 2 + 2).toFixed(1), // 2.0 - 4.0
      dangerZonesAvoided: 0,
      features: [
        'Shortest route',
        'Less traffic'
      ],
      warnings: [
        'Passes through poorly lit area',
        'Low footfall after 8 PM'
      ]
    };
  }
};

// POST /api/routes/compare - Compare safe vs normal route
router.post('/compare', async (req, res) => {
  try {
    const {
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
      timeOfDay
    } = req.body;

    if (!startLatitude || !startLongitude || !endLatitude || !endLongitude) {
      return res.status(400).json({
        error: 'Missing required fields: startLatitude, startLongitude, endLatitude, endLongitude'
      });
    }

    // Generate mock route data
    const safeRoute = generateRouteData(
      startLatitude, startLongitude,
      endLatitude, endLongitude,
      'safe'
    );

    const normalRoute = generateRouteData(
      startLatitude, startLongitude,
      endLatitude, endLongitude,
      'normal'
    );

    // Mock waypoints for visualization
    const safeWaypoints = [
      { lat: startLatitude, lng: startLongitude },
      { lat: startLatitude + 0.005, lng: startLongitude + 0.003 },
      { lat: startLatitude + 0.008, lng: startLongitude + 0.008 },
      { lat: endLatitude, lng: endLongitude }
    ];

    const normalWaypoints = [
      { lat: startLatitude, lng: startLongitude },
      { lat: startLatitude + 0.003, lng: startLongitude + 0.005 },
      { lat: endLatitude, lng: endLongitude }
    ];

    res.json({
      success: true,
      recommendation: 'safe',
      message: 'Safe route recommended for better security',
      routes: {
        safe: {
          ...safeRoute,
          waypoints: safeWaypoints
        },
        normal: {
          ...normalRoute,
          waypoints: normalWaypoints
        }
      },
      timeDifference: '2-3 mins longer but much safer',
      dangerZones: [
        {
          lat: startLatitude + 0.002,
          lng: startLongitude + 0.004,
          reason: 'Low lighting reported',
          severity: 'medium'
        }
      ]
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate route comparison',
      message: error.message
    });
  }
});

// GET /api/routes/safe - Get only safe route
router.get('/safe', async (req, res) => {
  try {
    const {
      startLat,
      startLng,
      endLat,
      endLng
    } = req.query;

    if (!startLat || !startLng || !endLat || !endLng) {
      return res.status(400).json({
        error: 'Missing required query parameters'
      });
    }

    const safeRoute = generateRouteData(
      parseFloat(startLat),
      parseFloat(startLng),
      parseFloat(endLat),
      parseFloat(endLng),
      'safe'
    );

    res.json({
      success: true,
      route: safeRoute
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate safe route',
      message: error.message
    });
  }
});

/* 
 * TODO: INTEGRATE REAL ROUTING API
 * 
 * To make this work with real data, integrate with:
 * 1. Google Maps Directions API
 * 2. Mapbox Directions API
 * 3. OpenRouteService API
 * 
 * Steps:
 * - Get API key from chosen provider
 * - Install SDK: npm install @googlemaps/google-maps-services-js
 * - Replace mock data with real API calls
 * - Combine with safety reports data for danger zones
 * - Calculate actual safety scores based on area data
 */

module.exports = router;
