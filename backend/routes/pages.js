const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Gig = require('../models/Gig');
const User = require('../models/User');

// Landing Page
router.get('/', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/dashboard');
  }
  res.render('pages/landing');
});

// Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    
    // Check daily limit
    if (!user.checkDailyLimit()) {
      return res.render('pages/dashboard', {
        gigs: [],
        limitReached: true,
        stats: {
          dailyViewed: user.dailyGigsViewed,
          dailyLimit: 20,
          isPremium: false
        }
      });
    }
    
    // Get gigs
    const limit = user.isActivePremium() ? 100 : 20;
    const gigs = await Gig.find()
      .sort({ score: -1, firstSeen: -1 })
      .limit(limit);
    
    // Update daily count
    if (!user.isActivePremium()) {
      user.dailyGigsViewed += gigs.length;
      await user.save();
    }
    
    res.render('pages/dashboard', {
      gigs,
      limitReached: false,
      stats: {
        dailyViewed: user.dailyGigsViewed,
        dailyLimit: user.isActivePremium() ? 'Unlimited' : 20,
        isPremium: user.isActivePremium()
      }
    });
    
  } catch (error) {
    console.error('Dashboard error:', error);
    res.render('pages/dashboard', { gigs: [], limitReached: false, stats: {} });
  }
});

// Premium Page
router.get('/premium', authMiddleware, (req, res) => {
  res.render('pages/premium');
});

// Profile Page
router.get('/profile', authMiddleware, async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('pages/profile', { user });
});

// Saved Gigs Page
router.get('/saved', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const gigIds = user.savedGigs.map(g => g.gigId);
    const gigs = await Gig.find({ tweetId: { $in: gigIds } });
    
    const gigsWithStatus = gigs.map(gig => ({
      ...gig.toObject(),
      userStatus: user.savedGigs.find(g => g.gigId === gig.tweetId).status
    }));
    
    res.render('pages/saved', { gigs: gigsWithStatus });
  } catch (error) {
    console.error('Saved gigs error:', error);
    res.render('pages/saved', { gigs: [] });
  }
});

module.exports = router;
