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
