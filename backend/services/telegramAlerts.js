// backend/services/telegramAlerts.js - Telegram Notifications for Premium Users

const axios = require('axios');

class TelegramAlerts {
  constructor() {
    // This will be set from environment or config
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || null;
    this.enabled = !!this.botToken;
  }
  
  /**
   * Send gig alert to user via Telegram
   */
  async sendGigAlert(chatId, gig) {
    if (!this.enabled || !chatId) {
      console.log('Telegram not configured or no chat ID');
      return false;
    }
    
    try {
      const message = this.formatGigMessage(gig);
      
      const response = await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: false
        }
      );
      
      console.log(`✅ Telegram alert sent to ${chatId}`);
      return true;
      
    } catch (error) {
      console.error('Telegram send error:', error.message);
      return false;
    }
  }
  
  /**
   * Send batch alerts (multiple gigs at once)
   */
  async sendBatchAlerts(chatId, gigs) {
    if (!this.enabled || !chatId || !gigs || gigs.length === 0) {
      return false;
    }
    
    try {
      // Send summary first
      const summaryMessage = `
🎯 <b>New Opportunities Alert!</b>

Found <b>${gigs.length}</b> new ambassador gigs!

Top gigs:
${gigs.slice(0, 5).map((g, i) => `${i+1}. [${g.score}/100] ${g.text.substring(0, 50)}...`).join('\n')}

Opening individual alerts...
      `;
      
      await this.sendMessage(chatId, summaryMessage);
      
      // Send top 3 individual gigs
      for (const gig of gigs.slice(0, 3)) {
        await this.sendGigAlert(chatId, gig);
        await this.sleep(1000); // Rate limit
      }
      
      return true;
      
    } catch (error) {
      console.error('Batch alert error:', error.message);
      return false;
    }
  }
  
  /**
   * Format gig into nice Telegram message
   */
  formatGigMessage(gig) {
    const scoreEmoji = gig.score >= 80 ? '🔥' : gig.score >= 60 ? '⭐' : '💼';
    const verifiedBadge = gig.author?.verified ? '✓' : '';
    
    let message = `
${scoreEmoji} <b>New Gig Alert!</b> [${gig.score}/100]

<b>@${gig.author?.username || 'Unknown'}</b> ${verifiedBadge}

${gig.text.substring(0, 300)}${gig.text.length > 300 ? '...' : ''}

📊 <b>Engagement:</b> ${gig.engagement?.likes || 0} likes • ${gig.engagement?.retweets || 0} RTs • ${gig.engagement?.replies || 0} replies
`;
    
    // Add application links
    if (gig.links && gig.links.length > 0) {
      message += `\n🔗 <b>Application Link:</b> ${gig.links[0]}`;
    }
    
    // Add X link
    message += `\n\n<a href="${gig.url}">View on X/Twitter →</a>`;
    
    // Add reasons for high score
    if (gig.score >= 60) {
      message += `\n\n<i>High score reasons: ${gig.text.includes('ambassador') ? 'Ambassador role' : ''} ${gig.links?.length ? '• Has link' : ''}</i>`;
    }
    
    return message.trim();
  }
  
  /**
   * Send simple text message
   */
  async sendMessage(chatId, text) {
    if (!this.enabled) return false;
    
    try {
      await axios.post(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML'
        }
      );
      return true;
    } catch (error) {
      console.error('Telegram message error:', error.message);
      return false;
    }
  }
  
  /**
   * Test connection
   */
  async testConnection(chatId) {
    return await this.sendMessage(
      chatId, 
      '✅ <b>Gig Hunter Connected!</b>\n\nYou will now receive alerts for new ambassador opportunities.'
    );
  }
  
  /**
   * Send welcome message to new premium user
   */
  async sendWelcome(chatId, username) {
    const message = `
🎉 <b>Welcome to Premium, ${username}!</b>

You now have:
✅ Unlimited gigs
✅ Telegram alerts (this!)
✅ Advanced filters
✅ Priority support

You'll receive alerts when high-quality gigs (60+ score) are found.

Happy hunting! 🚀
    `;
    
    return await this.sendMessage(chatId, message);
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = TelegramAlerts;