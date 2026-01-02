// backend/services/classifier.js - SMART VERSION - ONLY REAL HIRING POSTS

class HiringIntentClassifier {
  constructor() {
    this.minScore = 40; // Increased back to ensure quality
    
    // Ambassador-specific keywords
    this.ambassadorKeywords = [
      'ambassador', 'brand ambassador', 'community ambassador',
      'kol', 'key opinion leader', 'influencer',
      'advocate', 'evangelist', 'promoter',
      'representative', 'spokesperson'
    ];
    
    // Community & Social
    this.communityKeywords = [
      'community manager', 'community lead', 'community mod',
      'discord mod', 'telegram admin', 'moderator',
      'social media manager', 'social media',
      'content creator', 'content writer'
    ];
    
    // Marketing & Growth
    this.marketingKeywords = [
      'marketing', 'growth', 'partnerships',
      'business development', 'bd manager'
    ];
    
    // CRITICAL: Application instructions (MUST HAVE ONE)
    this.applicationKeywords = [
      // Links
      'apply here', 'application link', 'apply at', 'apply now',
      'form', 'google form', 'typeform', 'airtable',
      'notion', 'careers page', 'jobs page',
      // Direct contact
      'dm me', 'dm us', 'send dm', 'message me', 'message us',
      'email', 'send email', 'reach out',
      // Comment/Reply
      'comment below', 'drop your', 'leave a comment',
      'reply with', 'tag yourself', 'interested comment'
    ];
    
    // Technical roles to EXCLUDE
    this.technicalKeywords = [
      'developer', 'engineer', 'solidity', 'rust',
      'smart contract', 'blockchain developer',
      'frontend', 'backend', 'full stack', 'full-stack',
      'coding', 'programming', 'software'
    ];
    
    // Job SEEKING phrases (REJECT - these are people looking for jobs, not hiring)
    this.seekingPhrases = [
      "i'm looking for", "i am looking for", "i need", "i want",
      "looking for opportunities", "seeking opportunities",
      "anyone hiring", "any openings", "help me find",
      "where can i find", "how to find", "tips for finding",
      "anyone know", "does anyone", "trying to find",
      "searching for", "hunt for", "please help",
      "i applied", "i've applied", "still looking"
    ];
    
    // Company/Official phrases (GOOD - indicates official hiring)
    this.officialPhrases = [
      "we are hiring", "we're hiring", "we are looking for", "we're looking for",
      "join our team", "join us", "our team", "we need",
      "open position", "now hiring", "hiring now",
      "apply to join", "seeking to hire", "looking to hire"
    ];
  }
  
  classify(tweet) {
    const text = tweet.text.toLowerCase();
    const author = tweet.author || {};
    const engagement = tweet.engagement || {};
    
    let score = 0;
    let reasons = [];
    
    // ===== STEP 1: REJECT TECHNICAL ROLES =====
    const hasTechnical = this.technicalKeywords.some(kw => text.includes(kw));
    if (hasTechnical) {
      return { score: 0, reasons: ['Technical role detected'], breakdown: {} };
    }
    
    // ===== STEP 2: REJECT JOB SEEKING POSTS =====
    const isSeeking = this.seekingPhrases.some(phrase => text.includes(phrase));
    if (isSeeking) {
      return { score: 0, reasons: ['Job seeker post, not hiring'], breakdown: {} };
    }
    
    // ===== STEP 3: CHECK FOR OFFICIAL HIRING LANGUAGE =====
    const isOfficial = this.officialPhrases.some(phrase => text.includes(phrase));
    const hasHiringKeyword = text.includes('hiring') || text.includes('recruiting') || text.includes('recruiting');
    
    // Must have EITHER official phrase OR "hiring/recruiting" keyword
    if (!isOfficial && !hasHiringKeyword) {
      return { score: 0, reasons: ['No hiring intent detected'], breakdown: {} };
    }
    
    // ===== STEP 4: MUST HAVE APPLICATION INSTRUCTIONS (CRITICAL!) =====
    const hasApplicationInstructions = this.applicationKeywords.some(kw => text.includes(kw));
    const hasLink = tweet.links && tweet.links.length > 0;
    
    // REQUIRE: Either application keywords OR actual links
    if (!hasApplicationInstructions && !hasLink) {
      return { 
        score: 0, 
        reasons: ['No application instructions or links'], 
        breakdown: {} 
      };
    }
    
    // ===== STEP 5: ROLE TYPE SCORING (0-40 points) =====
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
    
    // If no specific role but has web3/crypto context
    if (roleScore === 0 && (text.includes('web3') || text.includes('crypto'))) {
      roleScore += 25;
      reasons.push('Web3 opportunity');
    }
    
    // If still no role identified, give minimum if other requirements met
    if (roleScore === 0) {
      roleScore += 20;
      reasons.push('General opportunity');
    }
    
    score += roleScore;
    
    // ===== STEP 6: APPLICATION CLARITY (0-25 points) =====
    let applicationScore = 0;
    
    // Has actual external link (BEST)
    if (hasLink) {
      applicationScore += 25;
      reasons.push('Has application link');
    }
    // Has clear DM instruction
    else if (text.includes('dm me') || text.includes('dm us') || text.includes('message me')) {
      applicationScore += 20;
      reasons.push('Clear DM instructions');
    }
    // Has comment instruction
    else if (text.includes('comment') || text.includes('drop your') || text.includes('tag yourself')) {
      applicationScore += 18;
      reasons.push('Comment application method');
    }
    // Has email mention
    else if (text.includes('email')) {
      applicationScore += 15;
      reasons.push('Email contact provided');
    }
    // Has generic application keyword
    else if (hasApplicationInstructions) {
      applicationScore += 12;
      reasons.push('Application method mentioned');
    }
    
    score += applicationScore;
    
    // ===== STEP 7: OFFICIAL LANGUAGE BONUS (0-15 points) =====
    if (isOfficial) {
      score += 15;
      reasons.push('Official company language');
    }
    
    // ===== STEP 8: AUTHOR CREDIBILITY (0-10 points) =====
    if (author.verified) {
      score += 10;
      reasons.push('Verified account');
    } else if (author.followers > 1000) {
      score += 5;
      reasons.push('Established account');
    }
    
    // ===== STEP 9: ENGAGEMENT (0-10 points) =====
    const totalEngagement = (engagement.likes || 0) + (engagement.retweets || 0) + (engagement.replies || 0);
    
    if (totalEngagement >= 5 && totalEngagement <= 50) {
      score += 10;
      reasons.push('Optimal engagement (early catch)');
    } else if (totalEngagement > 0 && totalEngagement < 5) {
      score += 8;
      reasons.push('Fresh post');
    } else if (totalEngagement > 50) {
      score += 5;
      reasons.push('Viral post');
    }
    
    // ===== STEP 10: SPAM DETECTION (PENALTIES) =====
    const spamWords = ['airdrop', 'giveaway', '100x', 'moon', 'lambo', 'free tokens', '$$$', '🚀🚀🚀'];
    const hasSpam = spamWords.some(kw => text.includes(kw));
    if (hasSpam) {
      score -= 40;
      reasons.push('Spam indicators detected');
    }
    
    // Check for excessive emojis (spam indicator)
    const emojiCount = (text.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
    if (emojiCount > 10) {
      score -= 20;
      reasons.push('Excessive emojis');
    }
    
    // Check for "tag 3 friends" spam
    if (text.includes('tag 3') || text.includes('tag friends') || text.includes('retweet and')) {
      score -= 30;
      reasons.push('Engagement farming');
    }
    
    // ===== FINAL SCORE =====
    score = Math.max(0, Math.min(100, score));
    
    const breakdown = {
      roleScore,
      applicationScore,
      officialBonus: isOfficial ? 15 : 0,
      authorScore: (author.verified ? 10 : 0) + (author.followers > 1000 ? 5 : 0),
      engagementScore: totalEngagement >= 5 && totalEngagement <= 50 ? 10 : 5
    };
    
    return {
      score: Math.round(score),
      reasons,
      breakdown
    };
  }
  
  /**
   * Quick check if tweet is likely a real hiring post
   */
  isLikelyHiring(tweet) {
    const text = tweet.text.toLowerCase();
    
    // Must NOT be seeking
    const isSeeking = this.seekingPhrases.some(phrase => text.includes(phrase));
    if (isSeeking) return false;
    
    // Must have application method
    const hasApplication = this.applicationKeywords.some(kw => text.includes(kw));
    const hasLink = tweet.links && tweet.links.length > 0;
    if (!hasApplication && !hasLink) return false;
    
    // Must have hiring intent
    const hasHiring = text.includes('hiring') || text.includes('recruiting') || 
                     this.officialPhrases.some(phrase => text.includes(phrase));
    if (!hasHiring) return false;
    
    return true;
  }
}

module.exports = HiringIntentClassifier;