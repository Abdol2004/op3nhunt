#!/bin/bash

echo "🔥 Building COMPLETE Professional EJS App"
echo "=========================================="

# ============= SERVER.JS =============
cat > backend/server.js << 'SERVERJS'
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const app = express();

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gig-hunter';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
}));

// Make user available to all views
app.use(async (req, res, next) => {
  if (req.session.userId) {
    const User = require('./models/User');
    req.user = await User.findById(req.session.userId);
    res.locals.user = req.user;
  } else {
    res.locals.user = null;
  }
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');
const gigRoutes = require('./routes/gigs');

app.use('/', authRoutes);
app.use('/', pageRoutes);
app.use('/gigs', gigRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Scanner - runs every 10 minutes
const Scanner = require('./services/scanner');
const scanner = new Scanner();

cron.schedule('*/10 * * * *', async () => {
  console.log('⏰ Running scheduled scan...');
  try {
    await scanner.scan();
  } catch (error) {
    console.error('Scan error:', error);
  }
});

// Initial scan after 10 seconds
setTimeout(() => {
  console.log('🎯 Running initial scan...');
  scanner.scan().catch(console.error);
}, 10000);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Gig Hunter running on http://localhost:${PORT}`);
});
SERVERJS

# ============= ROUTES =============
cat > backend/routes/auth.js << 'AUTHROUTES'
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register - Show Form
router.get('/register', (req, res) => {
  res.render('pages/register', { error: null });
});

// Register - Handle Form
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    if (password !== confirmPassword) {
      return res.render('pages/register', { error: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      return res.render('pages/register', { error: 'Password must be at least 6 characters' });
    }
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('pages/register', { 
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken' 
      });
    }
    
    const user = new User({ username, email, password });
    await user.save();
    
    req.session.userId = user._id;
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Register error:', error);
    res.render('pages/register', { error: 'Registration failed. Please try again.' });
  }
});

// Login - Show Form
router.get('/login', (req, res) => {
  res.render('pages/login', { error: null });
});

// Login - Handle Form
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.render('pages/login', { error: 'Invalid email or password' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('pages/login', { error: 'Invalid email or password' });
    }
    
    req.session.userId = user._id;
    res.redirect('/dashboard');
    
  } catch (error) {
    console.error('Login error:', error);
    res.render('pages/login', { error: 'Login failed. Please try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
AUTHROUTES

cat > backend/routes/pages.js << 'PAGEROUTES'
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
PAGEROUTES

cat > backend/routes/gigs.js << 'GIGROUTES'
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
GIGROUTES

echo "✓ Routes created"

