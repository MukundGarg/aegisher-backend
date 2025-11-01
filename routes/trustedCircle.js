// routes/trustedCircle.js — Final Claude version (frontend-compatible)
const express = require("express");
const router = express.Router();
const User = require("../models/User");

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
    if (!user) return res.status(404).json({ error: "User not found" });

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

    res.status(201).json(user.trustedCircle); // ✅ return full updated array
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

    res.json(user.trustedCircle); // ✅ return plain array
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch contacts", message: err.message });
  }
});

// ==================================================
// DELETE /api/trusted-circle/:userId/:contactId — Remove contact
// ==================================================
router.delete("/:userId/:contactId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.trustedCircle = user.trustedCircle.filter(
      c => c._id.toString() !== req.params.contactId
    );

    await user.save();

    res.json(user.trustedCircle); // ✅ return updated array again
  } catch (err) {
    res.status(500).json({ error: "Failed to delete contact", message: err.message });
  }
});

module.exports = router;