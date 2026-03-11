// server/models/Guild.js
const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  joinCode: { type: String, required: true, unique: true },
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  problems: [{
    // Helper field for the frontend
    problemType: { type: String, enum: ['solo', 'custom'], required: true }, 
    
    // --- THE FIX: ADD THESE THREE FIELDS ---
    displayTitle: { type: String }, // Captures the name for the Roadmap
    nodeTitle: { type: String },    // Fallback name
    source: { type: String },       // 'daily', 'shop', 'solo'
    // ---------------------------------------

    // Reference to TaskPool (The actual collection name)
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskPool' }, 
    
    customProblem: { 
      title: String,
      description: String,
      output: String,
      constraints: String,
      difficulty: { type: String, default: 'Medium' }
    },
    order: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Guild', GuildSchema);