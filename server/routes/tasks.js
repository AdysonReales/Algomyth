const express = require('express');
const router = express.Router();
const TaskPool = require('../models/TaskPool');
const User = require('../models/user');
const UserProgress = require('../models/UserProgress');
const DailyRotation = require('../models/DailyRotation');
const { protect } = require('../middleware/authMiddleware');

// --- HELPER: THE SMART MOCK GRADER ---
function checkConstraints(code, constraints) {
  if (!constraints || !Array.isArray(constraints) || constraints.length === 0) {
    return [];
  }

  let cleaned = (code || '')
    .replace(/\/\/.*$/gm, '')           
    .replace(/\/\*[\s\S]*?\*\//g, '')  
    .replace(/\s+/g, ' ')               
    .trim();

  const errors = [];
  
  if (!cleaned.includes(";")) {
    errors.push("Missing semicolon ';'");
  }

  const coutRegex = /cout\s*<<\s*([^;]+)\s*;/g;
  const coutMatches = [...cleaned.matchAll(coutRegex)];
  
  if (coutMatches.length === 0) {
    errors.push("You must print using cout.");
  }
  if (coutMatches.length > 5) {
    errors.push("Too many cout statements. Keep it optimized!");
  }

  for (const req of constraints) {
    if (!req || typeof req !== 'string') continue;

    if (req === "PRINT") {
      if (!/cout\s*<<\s*("[^"]*"|'[^']*'|[a-zA-Z_]\w*)\s*;/.test(cleaned)) {
        errors.push("Invalid print syntax. Expected: cout << value;");
      }
    }
    else if (req.startsWith("PRINT:")) {
      const text = req.replace("PRINT:", "").trim();
      const regex = new RegExp(`cout\\s*<<\\s*["']${text}["']\\s*;`);
      if (!regex.test(cleaned)) errors.push(`You must print exactly: "${text}"`);
    }
    else if (req.startsWith("VAR:")) {
      const variable = req.replace("VAR:", "").trim();
      if (!(new RegExp(`\\b${variable}\\b`)).test(cleaned)) errors.push(`Missing variable '${variable}'`);
    }
    else if (req.startsWith("TYPE:")) {
      const type = req.replace("TYPE:", "").trim();
      if (!(new RegExp(`\\b${type}\\b`)).test(cleaned)) errors.push(`Missing type '${type}'`);
    }
    else if (req.startsWith("OP:")) {
      const op = req.replace("OP:", "").trim();
      if (!cleaned.includes(op)) errors.push(`Operator '${op}' required`);
    }
  }
  return errors;
}

// --- NEW CRITICAL ROUTE: GET ALL TASKS (For Architect Library) ---
// This is the route that was returning (0) nodes because it was missing!
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await TaskPool.find();
    // Normalize source to lowercase so the frontend filters work perfectly
    const normalizedTasks = tasks.map(t => ({
      ...t.toObject(),
      source: (t.source || 'solo').toLowerCase()
    }));
    res.json(normalizedTasks);
  } catch (err) {
    console.error("Fetch All Tasks Error:", err);
    res.status(500).json({ message: "Error fetching task pool" });
  }
});

// @route   GET /api/tasks/solo-pool
router.get('/solo-pool', protect, async (req, res) => {
  try {
    const tasks = await TaskPool.find({ source: { $regex: /^solo$/i } }); 
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

    const errors = checkConstraints(code, activePhase.constraints);
    
    if (errors.length > 0) {
      let progress = await UserProgress.findOne({ user: req.user.id, task: taskId }) 
          || new UserProgress({ user: req.user.id, task: taskId });
      
      progress.currentStreak = 0; 
      await progress.save();

      return res.json({ 
        success: false, 
        message: `ALGO-MOCK: ${errors[0]}\n> Boss fully healed. Streak reset.`,
        currentStreak: 0 
      });
    }

    let progress = await UserProgress.findOne({ user: req.user.id, task: taskId }) 
        || new UserProgress({ user: req.user.id, task: taskId });

    progress.currentStreak = phaseIndex + 1; 
    const isFinalPhase = phaseIndex === task.requiredStreak - 1;
    let rewardIssued = false;

    if (isFinalPhase) {
      const user = await User.findById(req.user.id);

      if (!user.completedTasks) user.completedTasks = [];
      if (!user.achievements) user.achievements = [];

      // Helper to unlock achievements
      const unlock = (key) => {
        if (!user.achievements.includes(key)) user.achievements.push(key);
      };

      if (!user.completedTasks.includes(taskId)) {
        user.completedTasks.push(taskId);
      }
      const sourceStr = (task.source || "").toLowerCase().trim();
      const titleStr = (task.nodeTitle || "").toLowerCase();

      if (sourceStr === 'daily' || titleStr.includes('daily:')) {
        unlock('FIRST_DAILY');
      }

      if (!progress.isCleared) {
        progress.isCleared = true;
        rewardIssued = true;
        user.stats.gold += (task.reward.gold || 0);
        user.stats.xp += (task.reward.xp || 0);

        // --- ACHIEVEMENT CHECKS ---
        if ((task.source || '').toLowerCase() === 'daily') unlock('FIRST_DAILY');
        if (task.difficulty === 'Medium') unlock('BEAT_MEDIUM');
        if (task.difficulty === 'Boss') unlock('BEAT_HARD');
        
        // The Algorithm Myth (Finished all 7 Solo nodes)
        const soloCleared = await UserProgress.countDocuments({ user: req.user.id, isCleared: true });
        if (soloCleared >= 7) unlock('COMPLETE_SOLO');

        // LEVELING LOGIC
        let xpReq = Math.floor(100 * Math.pow(user.stats.level, 1.5));
        while (user.stats.xp >= xpReq) {
          user.stats.xp -= xpReq;
          user.stats.level += 1;
          xpReq = Math.floor(100 * Math.pow(user.stats.level, 1.5));
          
          // Level Achievements
          if (user.stats.level >= 5) unlock('LVL_5');
          if (user.stats.level >= 10) unlock('LVL_10');
        }
      }
      await user.save();
    }
    
    await progress.save();

    res.json({ 
      success: true, 
      message: isFinalPhase ? "TRIUMPH!" : "PHASE COMPLETE!", 
      cleared: isFinalPhase,
      currentStreak: progress.currentStreak
    });

  } catch (err) {
    console.error("Submit Error:", err);
    res.status(500).json({ message: "Internal Server Error in Judge" });
  }
});

// @route   GET /api/tasks/dailies
// @route   GET /api/tasks/dailies
router.get('/dailies', protect, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    let rotation = await DailyRotation.findOne({ date: today }).populate('questIds');
    
    if (!rotation) {
      const dailyPool = await TaskPool.find({ source: { $regex: /^daily$/i } });
      if (dailyPool.length === 0) {
        rotation = { questIds: [] }; 
      } else {
        const selected = dailyPool.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        try {
          rotation = new DailyRotation({ date: today, questIds: selected.map(q => q._id) });
          await rotation.save();
          await rotation.populate('questIds');
        } catch (saveErr) {
          // IF A DUPLICATE KEY ERROR HAPPENS (Error 11000)
          // It means another request just created the rotation. Fetch it.
          if (saveErr.code === 11000) {
            rotation = await DailyRotation.findOne({ date: today }).populate('questIds');
          } else {
            throw saveErr; // Rethrow if it's a different database error
          }
        }
      }
    }

    const user = await User.findById(req.user.id).populate('inventory.item');
    const boughtQuests = [];

    if (user.inventory && user.inventory.length > 0) {
      for (const inv of user.inventory) {
        if (inv.item && inv.item.category === 'Quest' && inv.item.unlocksTaskId) {
          const taskData = await TaskPool.findById(inv.item.unlocksTaskId);
          const progress = await UserProgress.findOne({ 
            user: req.user.id, 
            task: inv.item.unlocksTaskId 
          });
          
          if (taskData && (!progress || !progress.isCleared)) {
            boughtQuests.push({
              _id: inv._id,
              item: {
                ...taskData.toObject(),
                isBought: true
              }
            });
          }
        }
      }
    }

    res.json({
      mainDailies: rotation.questIds || [],
      boughtQuests: boughtQuests
    });
  } catch (err) {
    console.error("Dailies Error:", err);
    res.status(500).json({ message: "Failed to load bounty board." });
  }
});

// @route   GET /api/tasks/:id
router.get('/:id', async (req, res) => {
  try {
    const task = await TaskPool.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Fetch Error" });
  }
});

module.exports = router;