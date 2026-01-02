const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  tweetId: { type: String, required: true, unique: true },
  text: String,
  author: {
    username: String,
    displayName: String,
    verified: Boolean,
    followers: Number
  },
  url: String,
  engagement: { likes: Number, retweets: Number, replies: Number },
  links: [String],
  score: Number,
  category: { type: String, default: 'ambassador' },
  timestamp: Date,
  firstSeen: { type: Date, default: Date.now }
});

gigSchema.index({ score: -1, firstSeen: -1 });
module.exports = mongoose.model('Gig', gigSchema);
