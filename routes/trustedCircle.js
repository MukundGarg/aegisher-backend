// routes/trustedCircle.js — Trusted Circle Routes (final stable version)
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // ✅ Only User model is needed

// ==================================================
// POST /api/trusted-circle/:userId/add — Add a trusted contact
// ==================================================
router.post("/:userId/add", async (req, res) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: "Name and phone are required" });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent duplicate entries
    const existing = user.trustedCircle.find(c => c.phone === phone);
    if (existing) {
      return res.status(400).json({ error: "Contact already exists" });
    }

    const newContact = {
      name,
      phone,
      relationship: relationship || "friend",
      isPrimary: isPrimary || false,
      addedAt: new Date()
    };

    user.trustedCircle.push(newContact);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Contact added successfully",
      contact: user.trustedCircle[user.trustedCircle.length - 1]
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to add contact", message: err.message });
  }
});

// ==================================================
// GET /api/trusted-circle/:userId — Get all trusted contacts
// ==================================================
router.get("/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // ✅ Return a plain array (so frontend .map() works)
    res.json(user.trustedCircle);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts", message: err.message });
  }
});

// ==================================================
// DELETE /api/trusted-circle/:userId/:contactId — Remove a contact
// ==================================================
router.delete("/:userId/:contactId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.trustedCircle.findIndex(
      c => c._id.toString() === req.params.contactId
    );
    if (index === -1) {
      return res.status(404).json({ error: "Contact not found" });
    }

    user.trustedCircle.splice(index, 1);
    await user.save();

    res.json({ success: true, message: "Contact removed" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove contact", message: err.message });
  }
});

module.exports = router;