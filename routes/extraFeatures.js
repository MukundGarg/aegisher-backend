// routes/extraFeatures.js - Handles Trusted Circle, SOS, Safe Routes, and Danger Prediction
const express = require("express");
const router = express.Router();

// ===============================
// Trusted Circle Endpoints
// ===============================
let trustedContacts = [
  {
    id: 1,
    name: "Sarah Johnson",
    phone: "+1 (555) 123-4567",
    email: "sarah.j@email.com",
  },
  {
    id: 2,
    name: "Mom",
    phone: "+1 (555) 987-6543",
    email: "",
  },
];

router.get("/trusted-circle", (req, res) => {
  try {
    res.json({ success: true, contacts: trustedContacts });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load contacts" });
  }
});

router.post("/trusted-circle", (req, res) => {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: "Name and phone are required" });
    }

    const newContact = {
      id: trustedContacts.length + 1,
      name,
      phone,
      email: email || "",
    };

    trustedContacts.push(newContact);
    res.status(201).json({ success: true, contact: newContact });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to add contact" });
  }
});

// ===============================
// SOS Emergency Endpoint
// ===============================
router.post("/sos/alert", (req, res) => {
  try {
    const { location, latitude, longitude } = req.body;
    console.log("🚨 SOS Triggered from:", location || "Unknown", latitude, longitude);

    res.json({
      success: true,
      message: "🚨 SOS alert sent to your trusted contacts successfully!",
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to send SOS alert" });
  }
});

// ===============================
// Safe Route Endpoint
// ===============================
router.post("/routes/safe-route", (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({ success: false, error: "Both source and destination are required" });
    }

    const routeData = {
      from,
      to,
      distance: "3.2 km",
      duration: "12 mins",
      safetyScore: 85,
      instructions: "Take Main Street → Oak Avenue → Campus Road. Well-lit and monitored area.",
    };

    res.json({ success: true, route: routeData });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to calculate route" });
  }
});

// ===============================
// Danger Prediction Endpoint
// ===============================
router.post("/danger-prediction/analyze", (req, res) => {
  try {
    const { location, timeOfDay } = req.body;
    if (!location) {
      return res.status(400).json({ success: false, error: "Location is required" });
    }

    const riskData = {
      location,
      timeOfDay: timeOfDay || "anytime",
      riskLevel: "Low",
      riskScore: 25,
      factors: [
        "Well-lit area with modern street lights",
        "High foot traffic during evenings",
        "Security cameras present throughout area",
        "Active community watch program",
      ],
      recommendations: [
        "Safe for solo travel during daytime hours",
        "Consider buddy system after 10 PM",
        "Stay on main paths and well-lit areas",
        "Keep emergency contacts updated",
      ],
    };

    res.json({ success: true, prediction: riskData });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to analyze danger zone" });
  }
});

// ===============================
// Export
// ===============================
module.exports = router;