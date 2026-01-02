// backend/services/classifier.js - AGGRESSIVE VERSION FOR AMBASSADOR GIGS

class HiringIntentClassifier {
  constructor() {
    // AGGRESSIVE - Lower threshold for ambassador gigs
    this.minScore = 30; // Was 40-50, now 30 for more results
    
    // Ambassador-specific keywords (HIGH VALUE)
    this.ambassadorKeywords = [
      'ambassador', 'brand ambassador', 'community ambassador',
      'kol', 'key opinion leader', 'influencer',
      'advocate', 'evangelist', 'promoter',
      'representative', 'spokesperson'
    ];
    
    // Community & Social (HIGH VALUE)
    this.communityKeywords = [
      'community manager', 'community lead', 'community mod',
      'discord mod', 'telegram admin', 'moderator',
      'social media manager', 'social media',
      'content creator', 'content writer'
    ];
    
    // Marketing & Growth (MEDIUM VALUE)
    this.marketingKeywords = [
      'marketing', 'growth', 'partnerships',
      'business development', 'bd manager'
    ];
    
    // Hiring intent (MUST HAVE)
    this.hiringKeywords = [
      'hiring', 'looking for', 'seeking', 'need',
      'recruiting', 'join', 'position', 'role',
      'opportunity', 'apply', 'wanted', 'open'
    ];
    
    // Technical roles to EXCLUDE
    this.technicalKeywords = [
      'developer', 'engineer', 'solidity', 'rust',
      'smart contract', 'blockchain developer',
      'frontend', 'backend', 'full stack'
    ];
  }
  
  classify(tweet) {
    const text = tweet.text.toLowerCase();
    const author = tweet.author || {};
    const engagement = tweet.engagement || {};
    
    let score = 0;
    let reasons = [];
    
    // ===== STEP 1: CHECK FOR TECHNICAL ROLE (REJECT) =====
    const hasTechnical = this.technicalKeywords.some(kw => text.includes(kw));
    if (hasTechnical) {
      return { score: 0, reasons: ['Technical role detected'], breakdown: {} };
    }
    
    // ===== STEP 2: MUST HAVE HIRING INTENT =====
    const hasHiringIntent = this.hiringKeywords.some(kw => text.includes(kw));
    if (!hasHiringIntent) {
      return { score: 0, reasons: ['No hiring intent'], breakdown: {} };
    }
    
    // ===== STEP 3: ROLE TYPE SCORING (0-40 points) =====
    let roleScore = 0;
    
    // Ambassador roles (HIGHEST PRIORITY)
    const hasAmbassador = this.ambassadorKeywords.some(kw => text.includes(kw));
    if (hasAmbassador) {
      roleScore += 40;
      reasons.push('Ambassador role');
    }
    
    // Community & Social roles
    const hasCommunity = this.communityKeywords.some(kw => text.includes(kw));
    if (hasCommunity) {
      roleScore += 35;
      reasons.push('Community/Social role');
    }
    
    // Marketing roles
    const hasMarketing = this.marketingKeywords.some(kw => text.includes(kw));
    if (hasMarketing) {
      roleScore += 30;
      reasons.push('Marketing role');
    }
    
    // If no specific role, but has hiring intent + web3
    if (roleScore === 0 && (text.includes('web3') || text.includes('crypto'))) {
      roleScore += 25;
      reasons.push('Web3 opportunity');
    }
    
    score += roleScore;
    
    // ===== STEP 4: APPLICATION LINKS (0-20 points) =====
    const hasApplicationLink = tweet.links && tweet.links.length > 0;
    if (hasApplicationLink) {
      score += 20;
      reasons.push('Has application link');
    }
    
    // Check for application keywords in text
    const applicationWords = ['apply', 'dm', 'email', 'form', 'link', 'notion', 'airtable'];
    const hasAppInstructions = applicationWords.some(kw => text.includes(kw));
    if (hasAppInstructions) {
      score += 15;
      reasons.push('Clear application instructions');
    }
    
    // ===== STEP 5: AUTHOR CREDIBILITY (0-15 points) =====
    if (author.verified) {
      score += 10;
      reasons.push('Verified account');
    }
    
    if (author.followers > 1000) {
      score += 5;
      reasons.push('Established account');
    }
    
    // ===== STEP 6: ENGAGEMENT (0-15 points) =====
    const totalEngagement = (engagement.likes || 0) + (engagement.retweets || 0) + (engagement.replies || 0);
    
    if (totalEngagement >= 5 && totalEngagement <= 50) {
      // SWEET SPOT - not viral yet, but has traction
      score += 15;
      reasons.push('Optimal engagement (early catch)');
    } else if (totalEngagement > 0) {
      score += 10;
      reasons.push('Has engagement');
    }
    
    // ===== STEP 7: RECENCY BONUS (0-10 points) =====
    if (tweet.timestamp) {
      const age = Date.now() - new Date(tweet.timestamp).getTime();
      const hoursOld = age / (1000 * 60 * 60);
      
      if (hoursOld <= 24) {
        score += 10;
        reasons.push('Posted within 24 hours');
      } else if (hoursOld <= 72) {
        score += 5;
        reasons.push('Recent post');
      }
    }
    
    // ===== STEP 8: SPAM DETECTION (PENALTIES) =====
    const spamWords = ['airdrop', 'giveaway', '100x', 'moon', 'lambo', 'free tokens'];
    const hasSpam = spamWords.some(kw => text.includes(kw));
    if (hasSpam) {
      score -= 30;
      reasons.push('Spam indicators detected');
    }
    
    // Check for "I'm looking for" (author is seeking, not hiring)
    if (text.match(/i'?m looking for|i am looking for|does anyone know|anyone know/i)) {
      score -= 20;
      reasons.push('Author seeking help, not hiring');
    }
    
    // ===== FINAL SCORE =====
    score = Math.max(0, Math.min(100, score));
    
    const breakdown = {
      roleScore,
      hasLinks: hasApplicationLink ? 20 : 0,
      authorScore: (author.verified ? 10 : 0) + (author.followers > 1000 ? 5 : 0),
      engagementScore: totalEngagement >= 5 && totalEngagement <= 50 ? 15 : 10,
      recencyBonus: tweet.timestamp ? 10 : 0
    };
    
    return {
      score: Math.round(score),
      reasons,
      breakdown
    };
  }
}

module.exports = HiringIntentClassifier;