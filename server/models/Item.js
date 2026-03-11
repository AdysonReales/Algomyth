const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Head', 'Body', 'Accessory', 'Pet', 'Consumable', 'Quest'], 
    required: true 
  },
  image: { type: String, required: true },
  price: { type: Number, default: 0 },
  classReq: { type: String, enum: ['knight', 'mage', 'rogue', 'all'], default: 'all' },
  folder: { type: String, default: '' }, 
  variant: { type: String, default: '' },
  
  // --- CRITICAL ADDITION ---
  // This links the shop item to a specific task in your TaskPool
  unlocksTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskPool', default: null },
  
  stats: {
    hp: { type: Number, default: 0 },
    xpBonus: { type: Number, default: 0 },
    goldBonus: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Item', itemSchema);