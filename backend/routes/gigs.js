const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Save Gig
router.post('/save/:gigId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const existing = user.savedGigs.find(g => g.gigId === req.params.gigId);
    
    if (!existing) {
      user.savedGigs.push({
        gigId: req.params.gigId,
        status: 'saved',
        savedAt: new Date()
      });
      await user.save();
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save gig' });
  }
});

// Update Status
router.post('/status/:gigId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const { status } = req.body; // saved, applied, ignored
    
    const savedGig = user.savedGigs.find(g => g.gigId === req.params.gigId);
    if (savedGig) {
      savedGig.status = status;
    } else {
      user.savedGigs.push({
        gigId: req.params.gigId,
        status,
        savedAt: new Date()
      });
    }
    
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update status' });
  }
});

module.exports = router;
