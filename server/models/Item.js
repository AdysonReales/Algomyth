const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['Head', 'Body', 'Accessory', 'Pet', 'Consumable', 'Quest'], 
    required: true 
  },
  image: { type: String, required: true }, // URL or Path
  price: { type: Number, default: 0 },
  classReq: { type: String, enum: ['knight', 'mage', 'rogue', 'all'], default: 'all' },
  // For pets/accessories in subfolders
  folder: { type: String, default: '' }, 
  variant: { type: String, default: '' },
  stats: {
    hp: { type: Number, default: 0 },
    xpBonus: { type: Number, default: 0 },
    goldBonus: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model('Item', itemSchema);