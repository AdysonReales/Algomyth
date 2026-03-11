const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- AUTHENTICATION & IDENTITY ---
  username: { type: String, required: true, unique: true }, // The @handle used for searching
  displayName: { type: String }, // The aesthetic name shown on top (Twitter-style)
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'instructor', 'admin'], 
    default: 'student' 
  },

  // --- PROGRESSION & CURRENCY ---
  stats: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    gold: { type: Number, default: 5000 }
  },
  
  // --- SOCIAL & NOTIFICATIONS ---
  notifications: [{
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['message', 'invite', 'achievement', 'system'] },
    content: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],

  // --- AUDIO & GAME SETTINGS ---
  settings: {
    generalVolume: { type: Number, default: 70 },
    musicVolume: { type: Number, default: 50 },
    sfxVolume: { type: Number, default: 50 }
  },

  // --- ACHIEVEMENTS & DASHBOARD ---
  achievements: { type: [String], default: [] },
  pinnedAchievements: { 
    type: [String], 
    default: [null, null, null, null, null] 
  },

  // --- INVENTORY SYSTEM ---
  inventory: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: { type: Number, default: 1 },
    isEquipped: { type: Boolean, default: false },
    equippedSlot: { type: String, default: null },
    gridIndex: { type: Number, default: null }
  }],

  // --- CHARACTER CUSTOMIZATION (PAPERDOLL SYSTEM) ---
  characterIndex: { type: Number, default: 1 }, // 1-6 representing Gender/Class
  skinVariant: { type: String, default: 'default' }, // 'default', 'skinV1', etc.
  armorVariant: { type: String, default: 'default' }, // 'default', 'bluepink', etc.

}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);