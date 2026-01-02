// backend/services/scanner.js - WITH TELEGRAM ALERTS FOR PREMIUM USERS

const Scraper = require('./scraper');
const Classifier = require('./classifier');
const Gig = require('../models/Gig');
const User = require('../models/User');
const TelegramAlerts = require('./telegramAlerts');

class Scanner {
  constructor() {
    this.scraper = new Scraper();
    this.classifier = new Classifier();
    this.telegram = new TelegramAlerts();
  }
  
  async scan() {
    try {
      console.log('🎯 Starting scan...');
      
      const keywords = ['hiring', 'ambassador', 'kol', 'community manager'];
      const tweets = await this.scraper.searchTweets(keywords, 200);
      
      if (tweets.length === 0) {
        console.log('No tweets found');
        return { newGigs: 0 };
      }
      
      console.log(`Found ${tweets.length} tweets, classifying...`);
      
      const newGigs = [];
      const premiumGigs = []; // 60+ score for premium alerts
      
      for (const tweet of tweets) {
        const classification = this.classifier.classify(tweet);
        
        // AGGRESSIVE - Save if score >= 30 (was 40)
        if (classification.score >= 30) {
          const gig = {
            tweetId: tweet.id,
            text: tweet.text,
            author: tweet.author,
            url: tweet.url,
            engagement: tweet.engagement,
            links: tweet.links,
            score: classification.score,
            category: this.categorizeGig(tweet.text),
            timestamp: new Date(tweet.timestamp),
            firstSeen: new Date()
          };
          
          try {
            // Check if already exists
            const existing = await Gig.findOne({ tweetId: gig.tweetId });
            
            if (!existing) {
              await Gig.create(gig);
              newGigs.push(gig);
              
              // High score gigs go to premium users
              if (gig.score >= 60) {
                premiumGigs.push(gig);
              }
              
              console.log(`   ✅ Saved: [${gig.score}] ${gig.text.substring(0, 50)}...`);
            }
          } catch (err) {
            // Ignore duplicates
            if (!err.message.includes('duplicate')) {
              console.error(`   ❌ Save error: ${err.message}`);
            }
          }
        }
      }
      
      console.log(`✅ Saved ${newGigs.length} new gigs to database`);
      
      // Send Telegram alerts to premium users
      if (premiumGigs.length > 0) {
        await this.sendPremiumAlerts(premiumGigs);
      }
      
      return { 
        newGigs: newGigs.length,
        premiumGigs: premiumGigs.length
      };
      
    } catch (error) {
      console.error('Scanner error:', error);
      return { newGigs: 0 };
    }
  }
  
  /**
   * Send alerts to all premium users with Telegram enabled
   */
  async sendPremiumAlerts(gigs) {
    try {
      // Find all premium users with Telegram chat ID
      const premiumUsers = await User.find({
        isPremium: true,
        telegramChatId: { $exists: true, $ne: null }
      });
      
      if (premiumUsers.length === 0) {
        console.log('No premium users with Telegram configured');
        return;
      }
      
      console.log(`📱 Sending alerts to ${premiumUsers.length} premium users...`);
      
      for (const user of premiumUsers) {
        try {
          // Check if user is actually premium (not expired)
          if (user.isActivePremium()) {
            // Send top 3 gigs
            const topGigs = gigs.slice(0, 3);
            
            for (const gig of topGigs) {
              await this.telegram.sendGigAlert(user.telegramChatId, gig);
              await this.sleep(500); // Rate limit
            }
            
            console.log(`   ✅ Sent ${topGigs.length} alerts to ${user.username}`);
          }
        } catch (error) {
          console.error(`   ❌ Alert failed for ${user.username}:`, error.message);
        }
      }
      
    } catch (error) {
      console.error('Premium alerts error:', error);
    }
  }
  
  /**
   * Categorize gig based on keywords
   */
  categorizeGig(text) {
    const lower = text.toLowerCase();
    
    if (lower.includes('ambassador') || lower.includes('kol')) {
      return 'ambassador';
    }
    if (lower.includes('community') || lower.includes('discord') || lower.includes('telegram')) {
      return 'community';
    }
    if (lower.includes('social media') || lower.includes('content')) {
      return 'content';
    }
    if (lower.includes('marketing') || lower.includes('growth')) {
      return 'marketing';
    }
    
    return 'other';
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Scanner;