const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskPool' },
  currentStreak: { type: Number, default: 0 },
  isCleared: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);