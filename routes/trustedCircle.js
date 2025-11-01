// routes/trustedCircle.js - Trusted circle management routes (Claude-compatible)
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const TrustedContact = require('../models/TrustedContact'); // optional fallback

// ==================================================
// POST /api/trusted-circle - Add a trusted contact (frontend-compatible)
// ==================================================
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, relationship, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Temporary fallback user (since frontend doesn’t send userId)
    let user = await User.findOne();
    if (!user) {
      // create a default system user for demo/testing
      user = new User({ name: 'Demo User', phone: '0000000000', trustedCircle: [] });
      await user.save();
    }

    const newContact = {
      name,
      phone,
      email: email || null,
      relationship: relationship || 'friend',
      isPrimary: isPrimary || false,
      addedAt: new Date()
    };

    user.trustedCircle.push(newContact);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Contact added successfully',
      contact: newContact
    });
  } catch (error) {
    console.error('Error adding contact:', error);
    res.status(500).json({
      error: 'Failed to add contact',
      message: error.message
    });
  }
});

// ==================================================
// GET /api/trusted-circle - Get all trusted contacts
// ==================================================
router.get('/', async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      user = new User({ name: 'Demo User', phone: '0000000000', trustedCircle: [] });
      await user.save();
    }

    // ✅ Frontend expects an array, not { success: true, contacts: [...] }
    res.json(user.trustedCircle);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: error.message
    });
  }
});

// ==================================================
// DELETE /api/trusted-circle/:contactId - Remove a contact
// ==================================================
router.delete('/:contactId', async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contactIndex = user.trustedCircle.findIndex(
      c => c._id.toString() === req.params.contactId
    );

    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    user.trustedCircle.splice(contactIndex, 1);
    await user.save();

    res.json({ success: true, message: 'Contact removed' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({
      error: 'Failed to delete contact',
      message: error.message
    });
  }
});

// ==================================================
// Optional: Health check endpoint
// ==================================================
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Trusted Circle API is active and healthy!'
  });
});

module.exports = router;