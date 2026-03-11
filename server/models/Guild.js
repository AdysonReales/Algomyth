const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
  // --- IDENTITY & ACCESS ---
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  joinCode: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true 
  },

  // --- RELATIONSHIPS ---
  instructor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],

  // --- GUILD CONTENT: ANNOUNCEMENTS ---
  // Moved outside of 'problems' so the notice board works globally!
  announcements: [{
    content: { type: String, required: true },
    author: String,
    timestamp: { type: Date, default: Date.now }
  }],

  // --- GUILD CONTENT: ROADMAP / PROBLEMS ---
  problems: [{
    problemType: { 
      type: String, 
      enum: ['solo', 'custom'], 
      required: true 
    }, 
    displayTitle: String, 
    nodeTitle: String,    
    source: String,       
    
    // Reference to the main TaskPool
    problemId: { 
      type: String, 
      ref: 'TaskPool' 
    }, 
    
    // Data for instructor-created challenges
    customProblem: { 
      title: String,
      description: String,
      output: String,
      constraints: String,
      difficulty: { type: String, default: 'Medium' }
    },
    order: { type: Number, default: 0 }
  }]
}, { 
  timestamps: true // Automatically handles createdAt and updatedAt
});

module.exports = mongoose.model('Guild', GuildSchema);