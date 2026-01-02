#!/bin/bash

echo "Creating CSS and services..."

# ============= CSS =============
cat > public/css/style.css << 'CSS'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --dark: #1f2937;
  --light: #f9fafb;
  --gray: #6b7280;
  --border: #e5e7eb;
}

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: var(--dark);
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Navbar */
.navbar {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 20px;
}

.nav-brand a {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: var(--dark);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: var(--primary);
}

.premium-badge {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white !important;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-success, .btn-large {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
  display: inline-block;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-secondary {
  background: white;
  color: var(--primary);
  border: 2px solid var(--primary);
}

.btn-success {
  background: var(--secondary);
  color: white;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-full {
  width: 100%;
}

/* Hero */
.hero {
  text-align: center;
  padding: 6rem 0;
  color: white;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.gradient-text {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.95;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
}

.hero-note {
  opacity: 0.8;
  font-size: 0.95rem;
}

/* Features */
.features {
  background: white;
  padding: 5rem 0;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: var(--light);
  padding: 2rem;
  border-radius: 12px;
  transition: transform 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

/* Pricing */
.pricing {
  padding: 5rem 0;
  background: var(--light);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.pricing-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  position: relative;
}

.pricing-card.featured {
  transform: scale(1.05);
  border: 3px solid var(--primary);
}

.badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.price {
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary);
  margin: 1rem 0;
}

.price span {
  font-size: 1.25rem;
  color: var(--gray);
}

.pricing-features {
  list-style: none;
  text-align: left;
  margin: 2rem 0;
}

.pricing-features li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
}

/* Auth Pages */
.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
}

.auth-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1000px;
  margin: 0 auto;
}

.auth-card {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}

.auth-card h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: var(--gray);
  margin-bottom: 2rem;
}

.auth-form {
  margin: 2rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--dark);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary);
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  color: var(--gray);
}

.auth-footer a {
  color: var(--primary);
  text-decoration: none;
  font-weight: 600;
}

.auth-benefits {
  background: rgba(255,255,255,0.95);
  padding: 2.5rem;
  border-radius: 16px;
}

.auth-benefits h3 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.auth-benefits ul {
  list-style: none;
}

.auth-benefits li {
  padding: 0.75rem 0;
  font-size: 1.1rem;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.alert-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Dashboard */
.dashboard {
  background: white;
  min-height: calc(100vh - 200px);
  padding: 3rem 0;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-stats {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.stat-card {
  background: var(--light);
  padding: 1rem 1.5rem;
  border-radius: 12px;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--gray);
  margin-top: 0.25rem;
}

.gigs-grid {
  display: grid;
  gap: 1.5rem;
}

.gig-card {
  background: white;
  border: 2px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.gig-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);
}

.gig-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.gig-author {
  font-weight: 600;
}

.verified {
  background: #3b82f6;
  color: white;
  padding: 2px 6px;
  border-radius: 50%;
  font-size: 0.8rem;
  margin-left: 5px;
}

.gig-score {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
}

.score-high {
  background: #d1fae5;
  color: #065f46;
}

.score-medium {
  background: #fef3c7;
  color: #92400e;
}

.score-low {
  background: #fee2e2;
  color: #991b1b;
}

.gig-text {
  margin: 1rem 0;
  line-height: 1.6;
}

.gig-meta {
  display: flex;
  gap: 1.5rem;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: var(--gray);
}

.gig-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.gig-time {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--gray);
}

.limit-reached, .no-gigs {
  text-align: center;
  padding: 4rem 2rem;
}

/* Footer */
.footer {
  background: rgba(0,0,0,0.9);
  color: white;
  text-align: center;
  padding: 2rem 0;
  margin-top: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .auth-container {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .nav-links {
    flex-wrap: wrap;
  }
}

.text-muted {
  color: var(--gray);
  font-size: 0.9rem;
}

.cta-section {
  background: rgba(99, 102, 241, 0.1);
  padding: 5rem 0;
  text-align: center;
}

.cta-section h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.upgrade-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  margin-top: 3rem;
}

.upgrade-steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
}

.step {
  text-align: center;
}

.step-number {
  width: 60px;
  height: 60px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 auto 1rem;
}
CSS

echo "✓ CSS created"
ls -la public/css/

