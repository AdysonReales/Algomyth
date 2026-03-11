const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  requirementType: { type: String, required: true },
  requirementValue: { type: Number, required: true }
});

module.exports = mongoose.model('Achievement', AchievementSchema);