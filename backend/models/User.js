// backend/models/User.js - WITH TELEGRAM SUPPORT

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  premiumUntil: { 
    type: Date, 
    default: null 
  },
  dailyGigsViewed: { 
    type: Number, 
    default: 0 
  },
  lastResetDate: { 
    type: Date, 
    default: Date.now 
  },
  savedGigs: [{
    gigId: String,
    status: {
      type: String,
      enum: ['saved', 'applied', 'ignored'],
      default: 'saved'
    },
    savedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // TELEGRAM INTEGRATION
  telegramChatId: {
    type: String,
    default: null
  },
  telegramUsername: {
    type: String,
    default: null
  },
  // PREFERENCES
  alertThreshold: {
    type: Number,
    default: 60  // Only alert on gigs with 60+ score
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if premium is active
userSchema.methods.isActivePremium = function() {
  if (!this.isPremium) return false;
  if (!this.premiumUntil) return true; // Lifetime premium
  return new Date() < this.premiumUntil;
};

// Check and reset daily limit
userSchema.methods.checkDailyLimit = function() {
  const today = new Date().setHours(0, 0, 0, 0);
  const lastReset = new Date(this.lastResetDate).setHours(0, 0, 0, 0);
  
  if (today > lastReset) {
    this.dailyGigsViewed = 0;
    this.lastResetDate = new Date();
  }
  
  // Premium users have unlimited
  if (this.isActivePremium()) return true;
  
  // Free users: 20 per day
  return this.dailyGigsViewed < 20;
};

module.exports = mongoose.model('User', userSchema);