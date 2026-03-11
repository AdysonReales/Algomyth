// server/utils/achievementLogic.js
const User = require('../models/user'); // Ensure this matches your lowercase 'user.js'
const Achievement = require('../models/Achievement');

const checkAchievements = async (userId, type, value = 1) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    // Force initialize the array if it's missing
    if (!user.achievements) user.achievements = [];

    const allAchievements = await Achievement.find({ requirementType: type });
    let newlyUnlocked = [];

    for (const ach of allAchievements) {
      if (user.achievements.includes(ach.key)) continue;

      let metRequirement = false;
      if (type === 'SHOP_BUY') metRequirement = true;
      if (type === 'INVENTORY_EQUIP') metRequirement = user.inventory.some(inv => inv.isEquipped);

      if (metRequirement) {
        user.achievements.push(ach.key);
        newlyUnlocked.push(ach.title);
      }
    }

    if (newlyUnlocked.length > 0) {
      user.markModified('achievements'); // Tell Mongoose the array changed
      await user.save();
      console.log(`🏆 Achievement Unlocked: ${newlyUnlocked.join(', ')}`);
    }
    
    return newlyUnlocked;
  } catch (err) {
    console.error("❌ Achievement logic error:", err);
    return [];
  }
};

module.exports = { checkAchievements };