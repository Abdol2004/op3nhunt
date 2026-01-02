// backend/services/scraper.js - COMPLETE VERSION
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

class Scraper {
  constructor() {
    this.authPath = path.join(__dirname, '../data/auth.json');
  }

  async searchTweets(keywords, maxTweets = 200) {
    if (!this.checkAuth()) {
      console.error('❌ No auth.json found. Run: node backend/scripts/save-session.js');
      return [];
    }

    let browser = null;
    let allTweets = [];
    
    try {
      console.log('🚀 Launching X search...');
      
      browser = await chromium.launch({ 
        headless: true,
        args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
      });
      
      const context = await browser.newContext({
        storageState: this.authPath,
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });

      const page = await context.newPage();
      
      // Search queries for ambassador gigs
      const searchQueries = [
        'hiring ambassador web3',
        'brand ambassador crypto',
        'kol wanted web3',
        'community manager hiring',
        'hiring social media web3',
        'ambassador position crypto',
        'web3 influencer wanted',
        'hiring marketing web3'
      ];
      
      console.log(`🔍 Running ${searchQueries.length} searches...`);
      
      for (let i = 0; i < searchQueries.length; i++) {
        const query = searchQueries[i];
        
        try {
          console.log(`   [${i+1}/${searchQueries.length}] "${query}"`);
          
          const tweets = await this.searchSingleQuery(page, query, 30);
          allTweets = allTweets.concat(tweets);
          
          console.log(`      Found ${tweets.length} tweets`);
          
          await this.sleep(2000);
          
        } catch (error) {
          console.error(`   Search failed: ${error.message}`);
        }
      }
      
      await browser.close();
      
      // Remove duplicates
      const uniqueTweets = this.deduplicateByUrl(allTweets);
      
      console.log(`✅ Total: ${uniqueTweets.length} unique tweets`);
      
      return uniqueTweets;
      
    } catch (error) {
      if (browser) await browser.close();
      console.error(`Fatal scraping error: ${error.message}`);
      return [];
    }
  }

  async searchSingleQuery(page, query, maxResults = 30) {
    try {
      const encodedQuery = encodeURIComponent(query + ' -RT');
      const url = `https://x.com/search?q=${encodedQuery}&src=typed_query&f=live`;
      
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Scroll to load more
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 1000));
        await page.waitForTimeout(1000);
      }
      
      // Extract tweets
      const tweets = await page.evaluate((query) => {
        const results = [];
        const articles = document.querySelectorAll('article[data-testid="tweet"]');
        
        articles.forEach((article) => {
          try {
            const textEl = article.querySelector('[data-testid="tweetText"]');
            if (!textEl) return;
            
            const text = textEl.innerText;
            if (!text || text.length < 30) return;
            
            const linkEl = article.querySelector('a[href*="/status/"]');
            if (!linkEl) return;
            
            const href = linkEl.getAttribute('href');
            const match = href.match(/\/([^\/]+)\/status\/(\d+)/);
            if (!match) return;
            
            const username = match[1];
            const tweetId = match[2];
            const url = `https://x.com${href}`;
            
            const nameEl = article.querySelector('[data-testid="User-Name"]');
            const userText = nameEl ? nameEl.innerText : '';
            const lines = userText.split('\n');
            const displayName = lines[0] || username;
            
            const verified = !!article.querySelector('[aria-label*="Verified"]');
            
            const timeEl = article.querySelector('time');
            const timestamp = timeEl ? timeEl.getAttribute('datetime') : new Date().toISOString();
            
            const getCount = (selector) => {
              const el = article.querySelector(selector);
              if (!el) return 0;
              const aria = el.getAttribute('aria-label') || '';
              const numMatch = aria.match(/(\d+)/);
              return numMatch ? parseInt(numMatch[1]) : 0;
            };
            
            const likes = getCount('[data-testid="like"]');
            const retweets = getCount('[data-testid="retweet"]');
            const replies = getCount('[data-testid="reply"]');
            
            const allLinks = article.querySelectorAll('a[href]');
            const externalLinks = [];
            allLinks.forEach(a => {
              const href = a.getAttribute('href');
              if (href && href.startsWith('http') && 
                  !href.includes('x.com') && !href.includes('twitter.com') && !href.includes('t.co')) {
                externalLinks.push(href);
              }
            });
            
            results.push({
              id: tweetId,
              text: text,
              timestamp: timestamp,
              author: {
                username: username,
                displayName: displayName,
                verified: verified,
                followers: 0
              },
              engagement: {
                likes: likes,
                retweets: retweets,
                replies: replies
              },
              links: [...new Set(externalLinks)],
              url: url,
              searchQuery: query
            });
            
          } catch (err) {
            console.error('Parse error:', err.message);
          }
        });
        
        return results;
      }, query);
      
      return tweets;
      
    } catch (error) {
      console.error(`Query search error: ${error.message}`);
      return [];
    }
  }

  deduplicateByUrl(tweets) {
    const seen = new Set();
    const unique = [];
    
    for (const tweet of tweets) {
      if (!seen.has(tweet.url)) {
        seen.add(tweet.url);
        unique.push(tweet);
      }
    }
    
    return unique;
  }

  checkAuth() {
    try {
      if (!fs.existsSync(this.authPath)) {
        return false;
      }
      
      const data = JSON.parse(fs.readFileSync(this.authPath, 'utf8'));
      return data.cookies && data.cookies.some(c => c.name === 'auth_token');
    } catch (e) {
      return false;
    }
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = Scraper;