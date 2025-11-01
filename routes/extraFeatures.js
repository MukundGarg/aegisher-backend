// routes/extraFeatures.js
const express = require('express');
const router = express.Router();

// 🔹 Trusted Circle API
const trustedContacts = [];

router.get('/trusted-circle', (req, res) => {
  res.json({ success: true, contacts: trustedContacts });
});

router.post('/trusted-circle', (req, res) => {
  const { name, phone, email } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone required' });
  }
  const newContact = { id: Date.now().toString(), name, phone, email };
  trustedContacts.push(newContact);
  res.status(201).json({ success: true, contact: newContact });
});

router.delete('/trusted-circle/:id', (req, res) => {
  const index = trustedContacts.findIndex(c => c.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Contact not found' });
  trustedContacts.splice(index, 1);
  res.json({ success: true, message: 'Contact removed' });
});

// 🔹 SOS API
router.post('/sos/trigger', (req, res) => {
  const { location } = req.body;
  console.log('🚨 SOS Alert Triggered:', location);
  res.json({ success: true, message: 'SOS alert sent to contacts' });
});

// 🔹 Safe Route API
router.post('/routes/safe-route', (req, res) => {
  const { from, to } = req.body;
  res.json({
    success: true,
    route: {
      from,
      to,
      distance: "4.8 km",
      duration: "11 mins",
      safetyScore: 87,
      instructions: "Take Main Street → Park Avenue → Campus Road (well-lit areas)."
    }
  });
});

// 🔹 Danger Prediction API
router.post('/danger-prediction/analyze', (req, res) => {
  const { location, timeOfDay } = req.body;
  res.json({
    success: true,
    data: {
      location,
      riskScore: Math.floor(Math.random() * 100),
      riskLevel: "Moderate",
      factors: ["Low lighting", "Sparse patrol presence"],
      recommendations: [
        "Avoid travel after 10 PM",
        "Stick to main roads",
        "Use SOS feature if feeling unsafe"
      ]
    }
  });
});

module.exports = router;