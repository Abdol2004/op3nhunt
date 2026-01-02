#!/bin/bash

echo "Creating dashboard and premium views..."

# ============= DASHBOARD =============
cat > backend/views/pages/dashboard.ejs << 'DASHBOARD'
<%- include('../partials/header', { title: 'Dashboard' }) %>

<div class="dashboard">
  <div class="container">
    <div class="dashboard-header">
      <div>
        <h1>Your Opportunities</h1>
        <p>Latest Web3 Ambassador gigs, scored by AI</p>
      </div>
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-value"><%= stats.dailyViewed || 0 %></div>
          <div class="stat-label">Viewed Today</div>
        </div>
        <div class="stat-card">
          <div class="stat-value"><%= stats.dailyLimit %></div>
          <div class="stat-label">Daily Limit</div>
        </div>
        <% if (!stats.isPremium) { %>
          <a href="/premium" class="btn-primary">⭐ Upgrade</a>
        <% } %>
      </div>
    </div>
    
    <% if (limitReached) { %>
      <div class="limit-reached">
        <h2>Daily Limit Reached 📊</h2>
        <p>You've viewed your 20 gigs for today. Come back tomorrow or upgrade to Premium for unlimited access!</p>
        <a href="/premium" class="btn-primary">Upgrade to Premium ($5/month)</a>
      </div>
    <% } else if (gigs.length === 0) { %>
      <div class="no-gigs">
        <h2>No Gigs Found Yet 🔍</h2>
        <p>Our bot is searching X every 10 minutes. New gigs will appear here soon!</p>
        <p class="text-muted">Next scan in a few minutes...</p>
      </div>
    <% } else { %>
      <div class="gigs-grid">
        <% gigs.forEach(gig => { %>
          <div class="gig-card">
            <div class="gig-header">
              <div class="gig-author">
                <strong>@<%= gig.author.username %></strong>
                <% if (gig.author.verified) { %>
                  <span class="verified">✓</span>
                <% } %>
              </div>
              <div class="gig-score score-<%= gig.score >= 80 ? 'high' : gig.score >= 60 ? 'medium' : 'low' %>">
                <%= gig.score %>/100
              </div>
            </div>
            
            <p class="gig-text"><%= gig.text.substring(0, 200) %><%= gig.text.length > 200 ? '...' : '' %></p>
            
            <div class="gig-meta">
              <span>❤️ <%= gig.engagement.likes %></span>
              <span>🔄 <%= gig.engagement.retweets %></span>
              <span>💬 <%= gig.engagement.replies %></span>
              <% if (gig.links && gig.links.length > 0) { %>
                <span>🔗 Application Link</span>
              <% } %>
            </div>
            
            <div class="gig-actions">
              <a href="<%= gig.url %>" target="_blank" class="btn-primary">View on X</a>
              <button onclick="saveGig('<%= gig.tweetId %>')" class="btn-secondary">💾 Save</button>
              <button onclick="markApplied('<%= gig.tweetId %>')" class="btn-success">✅ Applied</button>
            </div>
            
            <div class="gig-time">
              <%= new Date(gig.timestamp).toLocaleString() %>
            </div>
          </div>
        <% }); %>
      </div>
    <% } %>
  </div>
</div>

<script>
function saveGig(gigId) {
  fetch('/gigs/save/' + gigId, { method: 'POST' })
    .then(r => r.json())
    .then(data => {
      alert('Gig saved! View in Saved section.');
    })
    .catch(err => alert('Error saving gig'));
}

function markApplied(gigId) {
  fetch('/gigs/status/' + gigId, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'applied' })
  })
  .then(r => r.json())
  .then(data => {
    alert('Marked as applied! 🎉');
  })
  .catch(err => alert('Error updating status'));
}
</script>

<%- include('../partials/footer') %>
DASHBOARD

# ============= PREMIUM PAGE =============
cat > backend/views/pages/premium.ejs << 'PREMIUM'
<%- include('../partials/header', { title: 'Premium' }) %>

<div class="premium-page">
  <div class="container">
    <div class="premium-hero">
      <h1>Upgrade to <span class="gradient-text">Premium</span></h1>
      <p class="premium-subtitle">Unlimited gigs, advanced features, priority support</p>
      <div class="premium-price">
        <span class="price-amount">$5</span>
        <span class="price-period">/month</span>
      </div>
    </div>
    
    <div class="premium-comparison">
      <div class="comparison-col">
        <h3>Free</h3>
        <ul>
          <li>✅ 20 gigs per day</li>
          <li>✅ Save & track gigs</li>
          <li>✅ Basic filters</li>
          <li>❌ Advanced filters</li>
          <li>❌ Email alerts</li>
          <li>❌ Priority support</li>
        </ul>
      </div>
      
      <div class="comparison-col featured">
        <div class="badge">Premium</div>
        <h3>Premium</h3>
        <ul>
          <li>✅ <strong>Unlimited gigs</strong></li>
          <li>✅ Save & track gigs</li>
          <li>✅ Basic filters</li>
          <li>✅ <strong>Advanced filters</strong></li>
          <li>✅ <strong>Email alerts</strong></li>
          <li>✅ <strong>Priority support</strong></li>
        </ul>
      </div>
    </div>
    
    <div class="premium-benefits">
      <h2>Premium Benefits</h2>
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">♾️</div>
          <h3>Unlimited Gigs</h3>
          <p>View as many opportunities as you want. No daily limits.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">🔍</div>
          <h3>Advanced Filters</h3>
          <p>Filter by category, score, engagement, and more.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">📧</div>
          <h3>Email Alerts</h3>
          <p>Get notified when high-scoring gigs are found.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">⚡</div>
          <h3>Priority Support</h3>
          <p>Direct access to our team for help and feedback.</p>
        </div>
      </div>
    </div>
    
    <div class="premium-cta">
      <h2>How to Upgrade</h2>
      <div class="upgrade-steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h3>Message on Telegram</h3>
            <p>Send a message to <strong>@<%= process.env.TELEGRAM_USERNAME || 'beebrain123' %></strong></p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h3>Provide Details</h3>
            <p>Include: Your username (<strong><%= user ? user.username : 'username' %></strong>), email, and payment method</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h3>Send Payment</h3>
            <p>$5 via PayPal, Crypto, or your preferred method</p>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h3>Get Upgraded</h3>
            <p>We'll activate Premium within 24 hours</p>
          </div>
        </div>
      </div>
      
      <div class="telegram-cta">
        <a href="https://t.me/<%= process.env.TELEGRAM_USERNAME || 'beebrain123' %>" target="_blank" class="btn-large btn-primary">
          💬 Message on Telegram
        </a>
        <p class="text-muted">Or send your details directly in the Telegram app</p>
      </div>
    </div>
  </div>
</div>

<%- include('../partials/footer') %>
PREMIUM

# ============= PROFILE PAGE =============
cat > backend/views/pages/profile.ejs << 'PROFILE'
<%- include('../partials/header', { title: 'Profile' }) %>

<div class="profile-page">
  <div class="container">
    <h1>Your Profile</h1>
    
    <div class="profile-grid">
      <div class="profile-card">
        <h2>Account Details</h2>
        <div class="profile-info">
          <div class="info-row">
            <span class="label">Username:</span>
            <span class="value"><%= user.username %></span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value"><%= user.email %></span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value">
              <% if (user.isActivePremium()) { %>
                <span class="badge badge-premium">👑 Premium</span>
              <% } else { %>
                <span class="badge badge-free">Free</span>
              <% } %>
            </span>
          </div>
          <div class="info-row">
            <span class="label">Member Since:</span>
            <span class="value"><%= new Date(user.createdAt).toLocaleDateString() %></span>
          </div>
        </div>
      </div>
      
      <div class="profile-card">
        <h2>Statistics</h2>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number"><%= user.savedGigs.length %></div>
            <div class="stat-label">Saved Gigs</div>
          </div>
          <div class="stat-box">
            <div class="stat-number"><%= user.savedGigs.filter(g => g.status === 'applied').length %></div>
            <div class="stat-label">Applied</div>
          </div>
          <div class="stat-box">
            <div class="stat-number"><%= user.dailyGigsViewed %></div>
            <div class="stat-label">Viewed Today</div>
          </div>
          <div class="stat-box">
            <div class="stat-number"><%= user.isActivePremium() ? '∞' : '20' %></div>
            <div class="stat-label">Daily Limit</div>
          </div>
        </div>
      </div>
    </div>
    
    <% if (!user.isActivePremium()) { %>
      <div class="upgrade-banner">
        <h3>🚀 Upgrade to Premium</h3>
        <p>Get unlimited gigs, advanced filters, and priority support for just $5/month</p>
        <a href="/premium" class="btn-primary">Learn More</a>
      </div>
    <% } %>
  </div>
</div>

<%- include('../partials/footer') %>
PROFILE

# ============= SAVED PAGE =============
cat > backend/views/pages/saved.ejs << 'SAVED'
<%- include('../partials/header', { title: 'Saved Gigs' }) %>

<div class="saved-page">
  <div class="container">
    <h1>Your Saved Gigs</h1>
    <p class="subtitle">Track your saved opportunities and applications</p>
    
    <% if (gigs.length === 0) { %>
      <div class="no-gigs">
        <h2>No Saved Gigs Yet</h2>
        <p>Start saving gigs from your dashboard to track them here.</p>
        <a href="/dashboard" class="btn-primary">Go to Dashboard</a>
      </div>
    <% } else { %>
      <div class="gigs-grid">
        <% gigs.forEach(gig => { %>
          <div class="gig-card">
            <div class="gig-header">
              <div class="gig-author">
                <strong>@<%= gig.author.username %></strong>
                <% if (gig.author.verified) { %>
                  <span class="verified">✓</span>
                <% } %>
              </div>
              <div class="gig-status">
                <% if (gig.userStatus === 'applied') { %>
                  <span class="badge badge-success">✅ Applied</span>
                <% } else if (gig.userStatus === 'ignored') { %>
                  <span class="badge badge-muted">Ignored</span>
                <% } else { %>
                  <span class="badge badge-info">💾 Saved</span>
                <% } %>
              </div>
            </div>
            
            <p class="gig-text"><%= gig.text.substring(0, 200) %><%= gig.text.length > 200 ? '...' : '' %></p>
            
            <div class="gig-meta">
              <span>❤️ <%= gig.engagement.likes %></span>
              <span>🔄 <%= gig.engagement.retweets %></span>
              <span>💬 <%= gig.engagement.replies %></span>
              <span>Score: <%= gig.score %>/100</span>
            </div>
            
            <div class="gig-actions">
              <a href="<%= gig.url %>" target="_blank" class="btn-primary">View on X</a>
              <% if (gig.userStatus !== 'applied') { %>
                <button onclick="markApplied('<%= gig.tweetId %>')" class="btn-success">✅ Mark Applied</button>
              <% } %>
            </div>
          </div>
        <% }); %>
      </div>
    <% } %>
  </div>
</div>

<script>
function markApplied(gigId) {
  fetch('/gigs/status/' + gigId, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'applied' })
  })
  .then(r => r.json())
  .then(data => {
    location.reload();
  });
}
</script>

<%- include('../partials/footer') %>
SAVED

echo "✓ Dashboard views created"

