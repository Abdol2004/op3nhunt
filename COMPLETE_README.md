# 🎯 GIG HUNTER - Complete EJS Version

## What This Is

A **COMPLETE** web application that finds Web3 Ambassador gigs on X (Twitter) 24/7.

### Features
✅ **Complete UI** - Landing, Register, Login, Dashboard (EJS templates)
✅ **User Authentication** - Session-based (no JWT tokens needed)
✅ **MongoDB Database** - Stores users and gigs
✅ **Premium Tiers** - Free (20/day) vs Premium (unlimited, $5)
✅ **24/7 Scraping** - Runs on Render without your laptop
✅ **Payment via Telegram** - Users message @beebrain123

### Tech Stack
- **Backend:** Node.js + Express + EJS
- **Database:** MongoDB Atlas (free)
- **Auth:** Express-session
- **Hosting:** Render (free)

---

## 🚀 QUICK START (10 Minutes)

### Step 1: MongoDB Setup

1. Go to **mongodb.com/cloud/atlas**
2. Create FREE account
3. Create FREE cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy connection string:
   ```
   mongodb+srv://username:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your password
7. Add `/gig-hunter` before `?`:
   ```
   mongodb+srv://username:pass@cluster.mongodb.net/gig-hunter?retryWrites=true&w=majority
   ```

### Step 2: Environment Setup

Create `.env`:
```env
MONGODB_URI=your_mongodb_uri_here
SESSION_SECRET=any-random-long-string-12345
PORT=3000
NODE_ENV=development
TELEGRAM_USERNAME=beebrain123
PREMIUM_PRICE=5
```

### Step 3: Install

```bash
npm install
```

### Step 4: X Authentication

```bash
node backend/scripts/save-session.js
```

Follow prompts to log into X.

### Step 5: Start

```bash
npm start
```

Open: **http://localhost:3000**

---

## 📱 USER FLOW

### 1. Landing Page (/)
- Hero section
- "Get Started" button
- Features list
- Pricing

### 2. Register (/register)
- Username, email, password
- Creates FREE account
- Auto-login after signup

### 3. Dashboard (/dashboard)
- See latest gigs (score-sorted)
- Save/Apply buttons
- Filter by status
- Daily limit counter (free users)

### 4. Premium Upgrade (/premium)
- Shows benefits
- Instructions to message @beebrain123
- Payment: $5 via PayPal/Crypto

### 5. Profile (/profile)
- User stats
- Saved gigs
- Account settings

---

## 💎 FREE vs PREMIUM

| Feature | Free | Premium |
|---------|------|---------|
| Daily Gigs | 20 | Unlimited ♾️ |
| Save Gigs | ✅ | ✅ |
| Apply Tracking | ✅ | ✅ |
| Advanced Filters | ❌ | ✅ |
| Email on @beebrain123 | - | ✅ |
| Price | $0 | $5/month |

---

## 🔧 ADMIN: Upgrade Users

### Method 1: MongoDB Compass (GUI)
1. Download MongoDB Compass
2. Connect with your URI
3. Open `users` collection
4. Find user
5. Edit: `isPremium: true, premiumUntil: null`
6. Save

### Method 2: MongoDB Shell
```javascript
use gig-hunter

db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isPremium: true, premiumUntil: null } }
)
```

---

## ☁️ DEPLOY TO RENDER (24/7 Running)

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Gig Hunter"
git remote add origin YOUR_GITHUB_REPO
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to **render.com**
2. New Web Service
3. Connect GitHub repo
4. Settings:
   - **Name:** gig-hunter
   - **Build:** `npm install && npx playwright install chromium`
   - **Start:** `npm start`
   - **Instance:** Free

5. Environment Variables:
   - `MONGODB_URI` = your_atlas_uri
   - `SESSION_SECRET` = random_string
   - `NODE_ENV` = production
   - `TELEGRAM_USERNAME` = beebrain123
   - `PREMIUM_PRICE` = 5

6. Deploy!

### Step 3: Upload X Auth

After deploy:
1. Click service → Shell
2. Run:
   ```bash
   mkdir -p backend/data
   cat > backend/data/auth.json
   ```
3. Paste auth.json content
4. Ctrl+D

### Step 4: Keep Alive

Use **cron-job.org**:
- URL: `https://your-app.onrender.com/health`
- Schedule: Every 5 minutes

---

## 🎨 PAGES INCLUDED

1. **/** - Landing page (marketing)
2. **/register** - Sign up form
3. **/login** - Login form
4. **/dashboard** - Main app (gigs list)
5. **/profile** - User profile
6. **/premium** - Upgrade page
7. **/saved** - Saved gigs
8. **/logout** - Logout

---

## 🔄 HOW IT WORKS

### Scraper (Runs Every 10 Minutes)
1. Searches X for: "ambassador", "kol wanted", "brand ambassador web3"
2. Extracts tweets with engagement data
3. Scores each gig (0-100)
4. Saves to MongoDB
5. Users see new gigs on dashboard

### Daily Limits (Free Users)
- 20 gigs per day
- Resets at midnight
- Counter tracked per user
- Premium = unlimited

### Save/Apply Tracking
- Click "Save" → Adds to savedGigs
- Click "Applied" → Marks status
- View all saved gigs at /saved

---

## 💰 MONETIZATION

### Payment Process
1. User clicks "Upgrade to Premium"
2. Sees: "Message @beebrain123 on Telegram"
3. User sends: "Username: X, Email: Y, $5 PayPal"
4. You receive payment
5. You upgrade user in MongoDB
6. User refreshes → Unlimited access!

### Revenue
- 100 users × $5 = $500/month
- 500 users × $5 = $2,500/month
- 1,000 users × $5 = $5,000/month

---

## 📊 COMPLETE FILE STRUCTURE

```
gig-hunter-complete/
├── backend/
│   ├── models/
│   │   ├── User.js ✓
│   │   └── Gig.js ✓
│   ├── routes/
│   │   ├── auth.js ✓
│   │   ├── gigs.js ✓
│   │   └── pages.js ✓
│   ├── services/
│   │   ├── scraper.js ✓
│   │   └── classifier.js ✓
│   ├── views/
│   │   ├── pages/
│   │   │   ├── landing.ejs ✓
│   │   │   ├── register.ejs ✓
│   │   │   ├── login.ejs ✓
│   │   │   ├── dashboard.ejs ✓
│   │   │   ├── premium.ejs ✓
│   │   │   └── profile.ejs ✓
│   │   └── partials/
│   │       ├── header.ejs ✓
│   │       └── footer.ejs ✓
│   ├── middleware/
│   │   ├── auth.js ✓
│   │   └── premium.js ✓
│   └── server.js ✓
├── public/
│   └── css/
│       └── style.css ✓
├── .env.example ✓
├── package.json ✓
├── Procfile ✓
└── README.md ✓
```

---

## ✅ WHAT'S INCLUDED

✅ Complete backend (Express + MongoDB)
✅ Complete frontend (EJS templates)
✅ User authentication (sessions)
✅ Premium tier logic
✅ X scraper (finds ambassador gigs)
✅ Scoring algorithm
✅ Save/apply tracking
✅ Responsive CSS
✅ Deployment guide
✅ Admin upgrade guide

---

## 🚀 READY TO USE

This is **100% COMPLETE** and ready to deploy!

1. Setup MongoDB (5 min)
2. Install dependencies (2 min)
3. Authenticate X (2 min)
4. Deploy to Render (10 min)
5. Start making money! 💰

---

**GOOD LUCK BRO!** 🎯💪

