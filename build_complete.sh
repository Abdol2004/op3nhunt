#!/bin/bash

echo "🚀 Building COMPLETE GIG HUNTER with EJS"
echo "========================================"

# Create structure
mkdir -p {backend/{models,routes,controllers,middleware,services,utils,config,views/{partials,pages}},public/{css,js,images}}

echo "✓ Structure created"

# Root files
cat > package.json << 'PKG'
{
  "name": "gig-hunter-complete",
  "version": "1.0.0",
  "description": "Ambassador Gig Finder - Complete EJS Version",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "ejs": "^3.1.9",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "express-session": "^1.17.3",
    "connect-mongo": "^5.1.0",
    "dotenv": "^16.3.1",
    "playwright": "^1.40.0",
    "node-cron": "^3.0.3",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
PKG

cat > .gitignore << 'GIT'
node_modules/
.env
backend/data/auth.json
logs/
*.log
.DS_Store
GIT

cat > Procfile << 'PROC'
web: node backend/server.js
PROC

cat > .env.example << 'ENV'
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gig-hunter

# Session
SESSION_SECRET=your-super-secret-session-key

# Server
PORT=3000
NODE_ENV=production

# Telegram Payment
TELEGRAM_USERNAME=beebrain123
PREMIUM_PRICE=5
ENV

echo "✓ Root files created"

