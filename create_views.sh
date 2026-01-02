#!/bin/bash

echo "Creating EJS views..."

# ============= PARTIALS =============
cat > backend/views/partials/header.ejs << 'HEADER'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof title !== 'undefined' ? title : 'Gig Hunter' %> - Ambassador Gig Finder</title>
  <link rel="stylesheet" href="/css/style.css">
</head>
<body>
  <nav class="navbar">
    <div class="container">
      <div class="nav-brand">
        <a href="/">🎯 Gig Hunter</a>
      </div>
      <div class="nav-links">
        <% if (user) { %>
          <a href="/dashboard">Dashboard</a>
          <a href="/saved">Saved</a>
          <% if (!user.isActivePremium()) { %>
            <a href="/premium" class="premium-badge">⭐ Upgrade</a>
          <% } else { %>
            <span class="premium-badge">👑 Premium</span>
          <% } %>
          <a href="/profile"><%= user.username %></a>
          <a href="/logout" class="btn-secondary">Logout</a>
        <% } else { %>
          <a href="/login">Login</a>
          <a href="/register" class="btn-primary">Get Started</a>
        <% } %>
      </div>
    </div>
  </nav>
HEADER

cat > backend/views/partials/footer.ejs << 'FOOTER'
  <footer class="footer">
    <div class="container">
      <p>&copy; 2025 Gig Hunter. Find Web3 Ambassador opportunities before everyone else.</p>
      <p>Built with 💪 for the Web3 community</p>
    </div>
  </footer>
</body>
</html>
FOOTER

# ============= LANDING PAGE =============
cat > backend/views/pages/landing.ejs << 'LANDING'
<%- include('../partials/header', { title: 'Home' }) %>

<div class="hero">
  <div class="container">
    <h1 class="hero-title">Find Web3 Ambassador Gigs<br><span class="gradient-text">Before Everyone Else</span></h1>
    <p class="hero-subtitle">Automated hunting for Ambassador, KOL, and Community roles on X (Twitter). Get alerts for opportunities with 5-30 likes — you'll be the first to apply!</p>
    <div class="hero-cta">
      <a href="/register" class="btn-large btn-primary">Get Started Free</a>
      <a href="/login" class="btn-large btn-secondary">Login</a>
    </div>
    <p class="hero-note">✨ Free: 20 gigs/day • Premium: Unlimited for $5/month</p>
  </div>
</div>

<div class="features">
  <div class="container">
    <h2 class="section-title">Why Gig Hunter?</h2>
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-icon">🎯</div>
        <h3>Early Detection</h3>
        <p>We find gigs with 5-30 likes. You apply before they go viral.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🤖</div>
        <h3>24/7 Hunting</h3>
        <p>Our bot searches X every 10 minutes. Never miss an opportunity.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⭐</div>
        <h3>Smart Scoring</h3>
        <p>AI scores each gig 0-100 based on quality, engagement, and authority.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💼</div>
        <h3>Non-Technical Only</h3>
        <p>Ambassador, KOL, Community Manager, Content Creator, Marketing roles.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">📊</div>
        <h3>Track Applications</h3>
        <p>Save gigs, mark as applied, track your success rate.</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">🚀</div>
        <h3>Premium Benefits</h3>
        <p>Unlimited gigs, advanced filters, priority support for $5/month.</p>
      </div>
    </div>
  </div>
</div>

<div class="pricing">
  <div class="container">
    <h2 class="section-title">Simple Pricing</h2>
    <div class="pricing-grid">
      <div class="pricing-card">
        <h3>Free</h3>
        <div class="price">$0<span>/forever</span></div>
        <ul class="pricing-features">
          <li>✅ 20 gigs per day</li>
          <li>✅ Save & track gigs</li>
          <li>✅ Basic filters</li>
          <li>✅ Community support</li>
        </ul>
        <a href="/register" class="btn-primary">Start Free</a>
      </div>
      <div class="pricing-card featured">
        <div class="badge">Most Popular</div>
        <h3>Premium</h3>
        <div class="price">$5<span>/month</span></div>
        <ul class="pricing-features">
          <li>✅ Unlimited gigs</li>
          <li>✅ Everything in Free</li>
          <li>✅ Advanced filters</li>
          <li>✅ Email alerts</li>
          <li>✅ Priority support</li>
        </ul>
        <a href="/register" class="btn-primary">Get Premium</a>
      </div>
    </div>
  </div>
</div>

<div class="cta-section">
  <div class="container">
    <h2>Ready to Find Your Next Gig?</h2>
    <p>Join hundreds of Web3 professionals who found opportunities before they went mainstream.</p>
    <a href="/register" class="btn-large btn-primary">Get Started Free</a>
  </div>
</div>

<%- include('../partials/footer') %>
LANDING

# ============= REGISTER PAGE =============
cat > backend/views/pages/register.ejs << 'REGISTER'
<%- include('../partials/header', { title: 'Register' }) %>

<div class="auth-page">
  <div class="auth-container">
    <div class="auth-card">
      <h1>Create Your Account</h1>
      <p class="auth-subtitle">Start finding Web3 gigs today. It's free!</p>
      
      <% if (error) { %>
        <div class="alert alert-error"><%= error %></div>
      <% } %>
      
      <form action="/register" method="POST" class="auth-form">
        <div class="form-group">
          <label>Username</label>
          <input type="text" name="username" required minlength="3" maxlength="20" placeholder="johndoe">
        </div>
        
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required placeholder="you@example.com">
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" required minlength="6" placeholder="At least 6 characters">
        </div>
        
        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" required placeholder="Re-enter password">
        </div>
        
        <button type="submit" class="btn-primary btn-full">Create Account</button>
      </form>
      
      <p class="auth-footer">
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
    
    <div class="auth-benefits">
      <h3>What you get:</h3>
      <ul>
        <li>✅ 20 gigs per day (free tier)</li>
        <li>✅ Save and track applications</li>
        <li>✅ AI-powered gig scoring</li>
        <li>✅ Early access to opportunities</li>
        <li>✅ Upgrade to Premium anytime</li>
      </ul>
    </div>
  </div>
</div>

<%- include('../partials/footer') %>
REGISTER

# ============= LOGIN PAGE =============
cat > backend/views/pages/login.ejs << 'LOGIN'
<%- include('../partials/header', { title: 'Login' }) %>

<div class="auth-page">
  <div class="auth-container">
    <div class="auth-card">
      <h1>Welcome Back</h1>
      <p class="auth-subtitle">Login to continue hunting gigs</p>
      
      <% if (error) { %>
        <div class="alert alert-error"><%= error %></div>
      <% } %>
      
      <form action="/login" method="POST" class="auth-form">
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required placeholder="you@example.com">
        </div>
        
        <div class="form-group">
          <label>Password</label>
          <input type="password" name="password" required placeholder="Your password">
        </div>
        
        <button type="submit" class="btn-primary btn-full">Login</button>
      </form>
      
      <p class="auth-footer">
        Don't have an account? <a href="/register">Sign up free</a>
      </p>
    </div>
    
    <div class="auth-benefits">
      <h3>Why Gig Hunter?</h3>
      <ul>
        <li>🎯 Find gigs before they go viral</li>
        <li>🤖 Automated 24/7 hunting</li>
        <li>⭐ AI-powered scoring</li>
        <li>💼 Non-technical roles only</li>
        <li>📊 Track your applications</li>
      </ul>
    </div>
  </div>
</div>

<%- include('../partials/footer') %>
LOGIN

echo "✓ Auth views created"

