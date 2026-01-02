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
