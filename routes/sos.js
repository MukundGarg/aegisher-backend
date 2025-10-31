// routes/sos.js - SOS Emergency alert routes
const express = require('express');
const router = express.Router();
const SOS = require('../models/SOS');
const User = require('../models/User');

// Utility function to send alerts (simulated)
const sendAlerts = async (user, sosAlert) => {
  console.log('\n🚨 SOS ALERT TRIGGERED! 🚨');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`User: ${user.name}`);
  console.log(`Phone: ${user.phone}`);
  console.log(`Location: ${sosAlert.location.coordinates[1]}, ${sosAlert.location.coordinates[0]}`);
  console.log(`Trigger Method: ${sosAlert.triggerMethod}`);
  console.log(`Time: ${new Date().toLocaleString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const alerts = [];

  // Send alerts to trusted circle
  for (const contact of user.trustedCircle) {
    console.log(`📱 Sending alert to: ${contact.name} (${contact.phone})`);
    
    // TODO: INTEGRATE REAL SMS/EMAIL HERE
    // Uncomment below to use Twilio for real SMS
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    try {
      await client.messages.create({
        body: `🚨 EMERGENCY! ${user.name} has triggered an SOS alert. Location: ${sosAlert.location.address || 'View map link'}. Please check on them immediately!`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: contact.phone
      });
      alerts.push({
        contactName: contact.name,
        contactPhone: contact.phone,
        sentAt: new Date(),
        status: 'sent'
      });
    } catch (error) {
      alerts.push({
        contactName: contact.name,
        contactPhone: contact.phone,
        sentAt: new Date(),
        status: 'failed'
      });
    }
    */

    // Simulated alert
    alerts.push({
      contactName: contact.name,
      contactPhone: contact.phone,
      sentAt: new Date(),
      status: 'sent'
    });
  }

  return alerts;
};

// POST /api/sos/trigger - Trigger SOS alert
router.post('/trigger', async (req, res) => {
  try {
    const { userId, latitude, longitude, address, triggerMethod } = req.body;

    if (!userId || !latitude || !longitude) {
      return res.status(400).json({
        error: 'Missing required fields: userId, latitude, longitude'
      });
    }

    // Find user and verify
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create SOS alert
    const sosAlert = new SOS({
      userId: user._id,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
        address: address || 'Unknown location'
      },
      triggerMethod: triggerMethod || 'manual',
      status: 'active'
    });

    // Send alerts to trusted circle
    const alertResults = await sendAlerts(user, sosAlert);
    sosAlert.alertsSent = alertResults;

    await sosAlert.save();

    res.status(200).json({
      success: true,
      message: 'SOS alert triggered successfully',
      sosId: sosAlert._id,
      alertsSent: alertResults.length,
      timestamp: sosAlert.createdAt
    });

  } catch (error) {
    console.error('Error triggering SOS:', error);
    res.status(500).json({
      error: 'Failed to trigger SOS alert',
      message: error.message
    });
  }
});

// GET /api/sos/history/:userId - Get SOS history for a user
router.get('/history/:userId', async (req, res) => {
  try {
    const sosHistory = await SOS.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: sosHistory.length,
      alerts: sosHistory
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch SOS history',
      message: error.message
    });
  }
});

// PATCH /api/sos/:sosId/resolve - Resolve an SOS alert
router.patch('/:sosId/resolve', async (req, res) => {
  try {
    const { status } = req.body; // 'resolved' or 'false_alarm'

    const sosAlert = await SOS.findByIdAndUpdate(
      req.params.sosId,
      {
        status: status || 'resolved',
        resolvedAt: new Date()
      },
      { new: true }
    );

    if (!sosAlert) {
      return res.status(404).json({ error: 'SOS alert not found' });
    }

    res.json({
      success: true,
      message: 'SOS alert resolved',
      alert: sosAlert
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to resolve SOS alert',
      message: error.message
    });
  }
});

module.exports = router;
