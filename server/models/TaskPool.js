// server/models/TaskPool.js
const mongoose = require('mongoose');

const PhaseSchema = new mongoose.Schema({
  questionTitle: { type: String, required: true },
  description: { type: String, required: true },
  constraints: { type: [String], default: [] },
  starterCode: { type: String, default: "" }
});

const TaskPoolSchema = new mongoose.Schema({
  nodeTitle: { type: String, required: true, unique: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Boss', 'Hard'], required: true },
  requiredStreak: { type: Number, default: 1 }, 
  
  // Update this to match your seed strings exactly! 
  source: { type: String, enum: ['Solo', 'Daily', 'Shop', 'solo', 'daily', 'shop'], default: 'solo' },
  
  phases: [PhaseSchema], 
  reward: { gold: { type: Number, default: 0 }, xp: { type: Number, default: 0 } }
});

module.exports = mongoose.model('TaskPool', TaskPoolSchema);