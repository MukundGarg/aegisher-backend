// routes/trustedCircle.js - Trusted circle management routes
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// POST /api/trusted-circle/:userId/add - Add a trusted contact
router.post('/:userId/add', async (req, res) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        error: 'Name and phone are required'
      });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if contact already exists
    const existingContact = user.trustedCircle.find(
      contact => contact.phone === phone
    );

    if (existingContact) {
      return res.status(400).json({
        error: 'Contact with this phone number already exists'
      });
    }

    // Add new contact
    const newContact = {
      name,
      phone,
      relationship: relationship || 'other',
      isPrimary: isPrimary || false,
      addedAt: new Date()
    };

    user.trustedCircle.push(newContact);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Contact added to trusted circle',
      contact: user.trustedCircle[user.trustedCircle.length - 1]
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to add contact',
      message: error.message
    });
  }
});

// GET /api/trusted-circle/:userId - Get all trusted contacts
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      count: user.trustedCircle.length,
      contacts: user.trustedCircle
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch trusted circle',
      message: error.message
    });
  }
});

// PUT /api/trusted-circle/:userId/:contactId - Update a contact
router.put('/:userId/:contactId', async (req, res) => {
  try {
    const { name, phone, relationship, isPrimary } = req.body;

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contact = user.trustedCircle.id(req.params.contactId);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Update contact fields
    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (relationship) contact.relationship = relationship;
    if (isPrimary !== undefined) contact.isPrimary = isPrimary;

    await user.save();

    res.json({
      success: true,
      message: 'Contact updated successfully',
      contact
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to update contact',
      message: error.message
    });
  }
});

// DELETE /api/trusted-circle/:userId/:contactId - Remove a contact
router.delete('/:userId/:contactId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const contactIndex = user.trustedCircle.findIndex(
      contact => contact._id.toString() === req.params.contactId
    );

    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    user.trustedCircle.splice(contactIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Contact removed from trusted circle'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to remove contact',
      message: error.message
    });
  }
});

module.exports = router;
