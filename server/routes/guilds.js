const express = require('express');
const router = express.Router();
const Guild = require('../models/Guild');
const { protect } = require('../middleware/authMiddleware');

// Helper to generate a random 6-character code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

router.post('/create', protect, async (req, res) => {
    try {
        const { name, description } = req.body;
        const newGuild = new Guild({
            name, description,
            joinCode: generateCode(),
            instructor: req.user.id,
            members: [req.user.id] // Auto-adds the creator
        });
        await newGuild.save();
        res.status(201).json(newGuild);
    } catch (err) {
        res.status(500).json({ message: "Error creating guild" });
    }
});

router.get('/', async (req, res) => {
  try {
    const guilds = await Guild.find();
    res.json(guilds);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch guilds" });
  }
});

router.post('/join', protect, async (req, res) => {
    try {
        const { code } = req.body;
        const guild = await Guild.findOne({ joinCode: code.toUpperCase() });
        if (!guild) return res.status(404).json({ message: "Invalid Class Code" });
        if (guild.members.includes(req.user.id)) return res.status(400).json({ message: "You are already in this guild" });

        guild.members.push(req.user.id);
        await guild.save();
        res.json({ message: `Successfully joined ${guild.name}!` });
    } catch (err) {
        res.status(500).json({ message: "Error joining guild" });
    }
});

router.put('/:guildId/path', protect, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ message: "Guild not found" });

    // Ensure the requester is the instructor or an admin
    if (guild.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized: Only the Guild Master can edit the Hall" });
    }

    // FIX: Normalize the problems array before saving to ensure clean data
    const normalizedProblems = req.body.problems.map(p => ({
      problemType: p.problemType,
      displayTitle: p.displayTitle,
      nodeTitle: p.nodeTitle,
      source: p.source,
      // If it's a solo task, store the ID. If it's custom, this will be the unique string ID.
      problemId: p.problemId,
      customProblem: p.problemType === 'custom' ? p.customProblem : null,
      order: p.order
    }));

    guild.problems = normalizedProblems;
    await guild.save();

    res.json({ 
      success: true,
      message: "Guild Hall Path updated successfully!", 
      problems: guild.problems 
    });
  } catch (err) {
    console.error("Guild Save Error:", err);
    res.status(500).json({ message: "Server error updating hall" });
  }
});
router.post('/:guildId/remove-student', protect, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.guildId);
    if (guild.instructor.toString() !== req.user.id) return res.status(403).json({ message: "Only the Grandmaster can exile members." });
    
    const { studentId } = req.body;
    guild.members = guild.members.filter(id => id.toString() !== studentId);
    await guild.save();
    res.json({ message: "Student has been removed from the roster.", members: guild.members });
  } catch (err) {
    res.status(500).json({ message: "Exile failed." });
  }
});

// 🛠️ THE MISSING ROUTE: LEAVE GUILD
router.post('/:guildId/leave', protect, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ message: "Guild not found" });

    guild.members = guild.members.filter(id => id.toString() !== req.user.id);
    await guild.save();
    res.json({ message: "You have departed from the guild roster." });
  } catch (err) {
    res.status(500).json({ message: "Departure failed." });
  }
});

// 🛠️ NEW ROUTE: ABOLISH CLASS
router.delete('/:guildId', protect, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ message: "Guild not found" });
    
    // Only the instructor can delete the class
    if (guild.instructor.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized." });

    await Guild.findByIdAndDelete(req.params.guildId);
    res.json({ message: "Class has been abolished." });
  } catch (err) {
    res.status(500).json({ message: "Failed to abolish class." });
  }
});

router.post('/:guildId/announcement', protect, async (req, res) => {
  try {
    const { content } = req.body;
    const guild = await Guild.findById(req.params.guildId);
    if (!guild) return res.status(404).json({ message: "Guild not found" });
    if (guild.instructor.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized." });

    // Safely add announcement
    if (!guild.announcements) guild.announcements = [];
    guild.announcements.unshift({ content, author: req.user.username || 'Grandmaster', timestamp: new Date() });
    await guild.save();
    res.json({ success: true, announcement: guild.announcements[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error during announcement." });
  }
});

router.get('/:guildId/progress-report', protect, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.guildId).populate({
      path: 'members',
      select: 'username stats progress completedTasks' 
    });
    if (guild.instructor.toString() !== req.user.id) return res.status(403).json({ message: "Access Denied." });
    res.json(guild.members);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch progress report." });
  }
});

module.exports = router;