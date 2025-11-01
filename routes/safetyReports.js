// routes/safetyReports.js — Final Claude version (frontend-compatible)
const express = require("express");
const router = express.Router();
const SafetyReport = require("../models/SafetyReport");

// ==================================================
// POST /api/safety-reports — Simplified submit endpoint for frontend
// ==================================================
router.post("/", async (req, res) => {
  try {
    const { type, location, description } = req.body;

    // Default fallback values for frontend compatibility
    const report = new SafetyReport({
      userId: null,
      location: {
        type: "Point",
        coordinates: [77.209, 28.6139], // Default to Delhi
        address: location || "Unknown location",
        placeName: ""
      },
      safetyRating: 3,
      reportType: type || "general",
      comment: description || "",
      timeOfDay: "evening",
      verified: false
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: "Safety report submitted successfully",
      report
    });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({
      error: "Failed to submit report",
      message: error.message
    });
  }
});

// ==================================================
// GET /api/safety-reports — Return all reports (frontend map support)
// ==================================================
router.get("/", async (req, res) => {
  try {
    const reports = await SafetyReport.find().sort({ createdAt: -1 });
    res.json(reports); // ✅ frontend expects an array for reports.map()
  } catch (error) {
    console.error("Error fetching safety reports:", error);
    res.status(500).json({
      error: "Failed to fetch safety reports",
      message: error.message
    });
  }
});

// ==================================================
// GET /api/safety-reports/nearby?latitude=&longitude=&radius=
// ==================================================
router.get("/nearby", async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude are required" });
    }

    const radiusInMeters = parseInt(radius) || 5000;
    const reports = await SafetyReport.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: radiusInMeters
        }
      }
    }).limit(50);

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch nearby reports", message: error.message });
  }
});

// ==================================================
// GET /api/safety-reports/:reportId — Fetch one report
// ==================================================
router.get("/:reportId", async (req, res) => {
  try {
    const report = await SafetyReport.findById(req.params.reportId);
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report", message: error.message });
  }
});

// ==================================================
// PATCH /api/safety-reports/:reportId/upvote — Upvote a report
// ==================================================
router.patch("/:reportId/upvote", async (req, res) => {
  try {
    const report = await SafetyReport.findByIdAndUpdate(
      req.params.reportId,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json({ success: true, message: "Report upvoted", upvotes: report.upvotes });
  } catch (error) {
    res.status(500).json({ error: "Failed to upvote report", message: error.message });
  }
});

// ==================================================
// GET /api/safety-reports/stats/summary — Safety statistics
// ==================================================
router.get("/stats/summary", async (req, res) => {
  try {
    const totalReports = await SafetyReport.countDocuments();
    const avgRatingResult = await SafetyReport.aggregate([
      { $group: { _id: null, averageRating: { $avg: "$safetyRating" } } }
    ]);

    const reportsByType = await SafetyReport.aggregate([
      { $group: { _id: "$reportType", count: { $sum: 1 } } }
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
    res.status(500).json({ error: "Failed to fetch statistics", message: error.message });
  }
});

// ==================================================
// GET /api/safety-reports/status — Health check
// ==================================================
router.get("/status", (req, res) => {
  res.json({ success: true, message: "Safety Reports API is live and healthy!" });
});

module.exports = router;