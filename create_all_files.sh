#!/bin/bash

echo "Creating all backend files..."

# ============= MODELS =============
cat > backend/models/User.js << 'USERMODEL'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  isPremium: { type: Boolean, default: false },
  premiumUntil: { type: Date, default: null },
  dailyGigsViewed: { type: Number, default: 0 },
  lastResetDate: { type: Date, default: Date.now },
  savedGigs: [{ gigId: String, status: String, savedAt: Date }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(pass) {
  return await bcrypt.compare(pass, this.password);
};

userSchema.methods.isActivePremium = function() {
  if (!this.isPremium) return false;
  if (!this.premiumUntil) return true;
  return new Date() < this.premiumUntil;
};

userSchema.methods.checkDailyLimit = function() {
  const today = new Date().setHours(0,0,0,0);
  const lastReset = new Date(this.lastResetDate).setHours(0,0,0,0);
  if (today > lastReset) {
    this.dailyGigsViewed = 0;
    this.lastResetDate = new Date();
  }
  return this.isActivePremium() || this.dailyGigsViewed < 20;
};

module.exports = mongoose.model('User', userSchema);
USERMODEL

cat > backend/models/Gig.js << 'GIGMODEL'
const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  tweetId: { type: String, required: true, unique: true },
  text: String,
  author: {
    username: String,
    displayName: String,
    verified: Boolean,
    followers: Number
  },
  url: String,
  engagement: { likes: Number, retweets: Number, replies: Number },
  links: [String],
  score: Number,
  category: { type: String, default: 'ambassador' },
  timestamp: Date,
  firstSeen: { type: Date, default: Date.now }
});

gigSchema.index({ score: -1, firstSeen: -1 });
module.exports = mongoose.model('Gig', gigSchema);
GIGMODEL

echo "✓ Models created"

# ============= MIDDLEWARE =============
cat > backend/middleware/auth.js << 'AUTHMID'
module.exports = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  res.redirect('/login');
};
AUTHMID

cat > backend/middleware/premium.js << 'PREMIUMMID'
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const user = await User.findById(req.session.userId);
  if (user && user.isActivePremium()) {
    return next();
  }
  res.redirect('/premium');
};
PREMIUMMID

echo "✓ Middleware created"

