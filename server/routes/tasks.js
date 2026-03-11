const express = require('express');
const router = express.Router();
const TaskPool = require('../models/TaskPool');
const User = require('../models/user');
const UserProgress = require('../models/UserProgress');
const { protect } = require('../middleware/authMiddleware');

// --- HELPER: THE SMART MOCK GRADER ---
function checkConstraints(code, constraints) {
  let cleaned = code
    .replace(/\/\/.*$/gm, '')           // remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')  // remove multi-line comments
    .replace(/\s+/g, ' ')               // normalize whitespace
    .trim();

  const errors = [];
  if (!cleaned.includes(";")) {
    errors.push("Missing semicolon ';'");
  }

  const coutRegex = /cout\s*<<\s*([^;]+)\s*;/g;
  const coutMatches = [...cleaned.matchAll(coutRegex)];
  const coutCount = coutMatches.length;

  if (coutCount === 0) errors.push("You must print using cout.");
  if (coutCount > 1) errors.push("Only one cout statement allowed.");

  for (const req of constraints) {
    if (req === "PRINT") {
      const validPrint = /cout\s*<<\s*("[^"]*"|'[^']*'|[a-zA-Z_]\w*)\s*;/;
      if (!validPrint.test(cleaned)) errors.push("Invalid print syntax. Expected: cout << value;");
      continue;
    }

    if (req.startsWith("PRINT:")) {
      const text = req.replace("PRINT:", "").trim();
      const regex = new RegExp(`cout\\s*<<\\s*"${text}"\\s*;`);
      if (!regex.test(cleaned)) errors.push(`You must print exactly: "${text}"`);
      continue;
    }

    if (req.startsWith("VAR:")) {
      const variable = req.replace("VAR:", "").trim();
      const varRegex = new RegExp(`\\b${variable}\\b`);
      if (!varRegex.test(cleaned)) errors.push(`Missing variable '${variable}'`);
      continue;
    }

    if (req.startsWith("TYPE:")) {
      const type = req.replace("TYPE:", "").trim();
      const typeRegex = new RegExp(`\\b${type}\\b`);
      if (!typeRegex.test(cleaned)) errors.push(`Missing type '${type}'`);
      continue;
    }

    if (req.startsWith("NUM:")) {
      const num = req.replace("NUM:", "").trim();
      const numRegex = new RegExp(`\\b${num}\\b`);
      if (!numRegex.test(cleaned)) errors.push(`Expected number '${num}'`);
      continue;
    }

    if (req.startsWith("OP:")) {
      const op = req.replace("OP:", "").trim();
      if (!cleaned.includes(op)) errors.push(`Operator '${op}' required`);
      continue;
    }
  }
  return errors;
}

// @route   GET /api/tasks/solo-pool
// @route   GET /api/tasks/solo-pool
// server/routes/tasks.js

router.get('/solo-pool', protect, async (req, res) => {
  try {
    // Search for both 'Solo' and 'solo' to be safe 
    const tasks = await TaskPool.find({ 
      source: { $in: ['Solo', 'solo'] } 
    }); 
    
    const progress = await UserProgress.find({ user: req.user.id });

    const tasksWithProgress = tasks.map(task => {
      const userProg = progress.find(p => p.task.toString() === task._id.toString());
      return { 
        ...task.toObject(), 
        isCleared: userProg ? userProg.isCleared : false 
      };
    });
    res.json(tasksWithProgress);
  } catch (err) {
    res.status(500).json({ message: "Solo fetch failed" });
  }
});

// @route   POST /api/tasks/submit
router.post('/submit', protect, async (req, res) => {
  const { taskId, phaseIndex, code } = req.body;

  try {
    const task = await TaskPool.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const activePhase = task.phases[phaseIndex];
    if (!activePhase) return res.status(400).json({ message: "Invalid phase index" });

    // 1. Run the Mock Judge
    const errors = checkConstraints(code, activePhase.constraints);
    
    // --- DEBUG FIX: WIPE STREAK ON FAILURE ---
    if (errors.length > 0) {
      let progress = await UserProgress.findOne({ user: req.user.id, task: taskId }) 
          || new UserProgress({ user: req.user.id, task: taskId });
      
      progress.currentStreak = 0; // Reset health in DB
      await progress.save();

      return res.json({ 
        success: false, 
        message: `ALGO-MOCK: ${errors[0]}\n> BOSS FULLY HEALED. STREAK RESET.`,
        currentStreak: 0 // Tell frontend to reset the health bar
      });
    }

    // 2. Fetch or Create Progress (For Success)
    let progress = await UserProgress.findOne({ user: req.user.id, task: taskId }) 
        || new UserProgress({ user: req.user.id, task: taskId });

    // Update the streak so health doesn't reset when leaving the page successfully
    progress.currentStreak = phaseIndex + 1; 
    
    const isFinalPhase = phaseIndex === task.requiredStreak - 1;

    // 3. Final Phase Logic (Rewards & Leveling)
    if (isFinalPhase && !progress.isCleared) {
      progress.isCleared = true;
      const user = await User.findById(req.user.id);
      
      // Add rewards
      user.stats.gold += (task.reward.gold || 0);
      user.stats.xp += (task.reward.xp || 0);

      // --- DYNAMIC LEVELING LOGIC ---
      let xpRequired = Math.floor(100 * Math.pow(user.stats.level, 1.5));

      while (user.stats.xp >= xpRequired) {
        user.stats.xp -= xpRequired;
        user.stats.level += 1;
        xpRequired = Math.floor(100 * Math.pow(user.stats.level, 1.5));
      }

      await user.save();
    }
    
    // Always save progress after a successful phase
    await progress.save();

    return res.json({ 
      success: true, 
      message: isFinalPhase ? "NODE CLEARED!" : "PHASE COMPLETE!", 
      cleared: isFinalPhase,
      currentStreak: progress.currentStreak // Send this back so frontend can update health
    });

  } catch (err) {
    console.error("Submit Error:", err);
    res.status(500).json({ message: "Mock Judge Error" });
  }
});

//this line below would be made for the daily rotating stuff.
// server/routes/tasks.js
// server/routes/tasks.js

const DailyRotation = require('../models/DailyRotation');

// @route   GET /api/tasks/dailies
// server/routes/tasks.js -> /dailies route
router.get('/dailies', protect, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    let rotation = await DailyRotation.findOne({ date: today }).populate('questIds');
    
    if (!rotation) {
      // FIX: Use a Case-Insensitive regex or check both versions
      const dailyPool = await TaskPool.find({ 
        source: { $regex: /^daily$/i } 
      });

      console.log(`Found ${dailyPool.length} dailies in pool.`); // Check your terminal!

      if (dailyPool.length === 0) {
          return res.status(404).json({ message: "No daily tasks found in DB. Run seed.js!" });
      }

      const selected = dailyPool.sort(() => 0.5 - Math.random()).slice(0, 3);
      rotation = new DailyRotation({ date: today, questIds: selected.map(q => q._id) });
      await rotation.save();
      await rotation.populate('questIds');
    }
    // B. Handle Bought Quests (Find 'Quest' items in inventory and get their linked tasks)
    const user = await User.findById(req.user.id).populate('inventory.item');
    const boughtQuests = [];
    for (const inv of user.inventory) {
      if (inv.item?.category === 'Quest' && inv.item.unlocksTaskId) {
        const taskData = await TaskPool.findById(inv.item.unlocksTaskId);
        if (taskData) {
          boughtQuests.push({ ...inv.toObject(), item: taskData }); 
        }
      }
    }

    res.json({
      mainDailies: rotation.questIds,
      boughtQuests: boughtQuests
    });
  } catch (err) {
    res.status(500).json({ message: "Dailies failed" });
  }
});

router.get('/', async (req, res) => {
  try {
    const tasks = await TaskPool.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching task pool" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await TaskPool.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Challenge not found in Database" });
    }
    res.json(task);
  } catch (err) {
    console.error("ID Fetch Error:", err);
    res.status(500).json({ message: "Invalid ID format or Server Error" });
  }
});

module.exports = router;