const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/user'); 
const { protect } = require('../middleware/authMiddleware');
const { checkAchievements } = require('../utils/achievementLogic');

// @route   GET /api/shop/items
router.get('/items', async (req, res) => {
    try {
        const items = await Item.find({});
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: "Server error fetching items" });
    }
});

// @route   POST /api/shop/buy/:id
router.post('/buy/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    // 1. Prevent Double Buying of unique items
    const alreadyOwned = user.inventory.some(inv => inv.item.toString() === item._id.toString());
    const isUnique = ['Quest', 'Head', 'Body', 'Accessory', 'Pet'].includes(item.category);

    if (alreadyOwned && isUnique) {
      return res.status(400).json({ message: "You already own this unique item!" });
    }

    // 2. Gold Check
    if (user.stats.gold < item.price) {
      return res.status(400).json({ message: "Not enough gold!" });
    }

    // 3. Grid Logic: Quests to -1, others to 0-14
    let targetIndex = -1;
    if (item.category !== 'Quest') {
      const occupiedIndices = user.inventory
        .filter(i => !i.isEquipped && i.gridIndex !== -1)
        .map(i => i.gridIndex);

      for (let i = 0; i < 15; i++) {
        if (!occupiedIndices.includes(i)) {
          targetIndex = i;
          break;
        }
      }

      if (targetIndex === -1) {
        return res.status(400).json({ message: "Inventory Full!" });
      }
    }

    // 4. Transaction
    user.stats.gold -= item.price;
    user.inventory.push({ 
      item: item._id, 
      gridIndex: targetIndex, 
      isEquipped: false 
    });

    // Save purchase before checking achievements
    await user.save();

    // 5. Trigger Achievement Check
    // This adds the achievement key to user.achievements if met
    await checkAchievements(user._id, 'SHOP_BUY');

    // 6. Fetch FULL updated user data to sync frontend
    const updatedUser = await User.findById(req.user.id).populate('inventory.item');

    res.json({ 
      message: `Purchased ${item.name}!`, 
      user: updatedUser // Send the WHOLE updated user back
    });

  } catch (err) {
    console.error("Shop Error:", err);
    res.status(500).json({ message: "Purchase failed" });
  }
});

// @route   PUT /api/shop/move
// NEW: Handles shifting items around in the inventory grid
router.put('/move', protect, async (req, res) => {
    const { invId, newGridIndex } = req.body;
    try {
        const user = await User.findById(req.user.id);
        const item = user.inventory.id(invId);
        if (item) {
            item.gridIndex = newGridIndex;
            await user.save();
        }
        res.json({ message: "Moved!" });
    } catch (err) {
        res.status(500).json({ message: "Move failed" });
    }
});

// @route   POST /api/shop/sell
router.post('/sell', protect, async (req, res) => {
  const { inventoryId } = req.body;
  try {
    // We populate 'item' so we can access item.price
    const user = await User.findById(req.user.id).populate('inventory.item');
    const invItem = user.inventory.id(inventoryId);

    if (!invItem) return res.status(404).json({ message: "Item not found" });

    const sellPrice = Math.floor((invItem.item.price || 0) * 0.5);
    user.stats.gold += sellPrice;
    
    // Use .pull to remove the subdocument by ID
    user.inventory.pull(inventoryId); 

    await user.save();
    res.json({ message: `Sold for ${sellPrice} gold!` });
  } catch (err) {
    res.status(500).json({ message: "Sale failed" });
  }
});
// @route   POST /api/shop/equip
router.post('/equip', protect, async (req, res) => {
    try {
        const { inventoryId, slot } = req.body; 
        const user = await User.findById(req.user.id);

        user.inventory.forEach(inv => {
            if (inv.equippedSlot === slot) {
                inv.isEquipped = false;
                inv.equippedSlot = null;
            }
        });

        const targetItem = user.inventory.id(inventoryId);
        if (targetItem) {
            targetItem.isEquipped = true;
            targetItem.equippedSlot = slot;
            targetItem.gridIndex = null; 
        }

        await user.save();
        await checkAchievements(user._id, 'INVENTORY_EQUIP');
        res.json({ message: "Item equipped!" });
    } catch (err) {
        res.status(500).json({ message: "Equip failed" });
    }
});

// @route   POST /api/shop/unequip
router.post('/unequip', protect, async (req, res) => {
    try {
        const { inventoryId, gridIndex } = req.body; 
        const user = await User.findById(req.user.id);
        const targetItem = user.inventory.id(inventoryId);

        if (targetItem) {
            targetItem.isEquipped = false;
            targetItem.equippedSlot = null;
            targetItem.gridIndex = gridIndex; 
            await user.save();
        }
        res.json({ message: "Item returned to bag!" });
    } catch (err) {
        res.status(500).json({ message: "Unequip failed" });
    }
});
router.post('/use-item', protect, async (req, res) => {
  try {
    const { invId } = req.body;
    const user = await User.findById(req.user.id).populate('inventory.item');
    
    const invIndex = user.inventory.findIndex(i => i._id.toString() === invId);
    if (invIndex === -1) return res.status(404).json({ message: "Item not found" });

    const item = user.inventory[invIndex].item;

    if (item.category === 'Consumable') {
      user.stats.xp += 500; // Add XP
      user.inventory.splice(invIndex, 1); // Remove from inventory
      await user.save();
      return res.json({ message: "Gained 500 XP!", user });
    }

    res.status(400).json({ message: "This item is not consumable." });
  } catch (err) { res.status(500).json({ message: "Usage failed." }); }
});

module.exports = router;