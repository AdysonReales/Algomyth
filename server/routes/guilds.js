const express = require('express');
const router = express.Router();
const Guild = require('../models/Guild');
const { protect } = require('../middleware/authMiddleware');

// Helper to generate a random 6-character code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// @route   POST /api/guilds/create
// @desc    Instructor creates a Guild
router.post('/create', protect, async (req, res) => {
    try {
        const { name, description } = req.body;
        const newGuild = new Guild({
            name,
            description,
            joinCode: generateCode(),
            instructor: req.user.id,
            members: [req.user.id] // Auto-adds the creator as the first member
        });
        await newGuild.save();
        res.status(201).json(newGuild);
    } catch (err) {
        console.error("Create Guild Error:", err.message);
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

// @route   POST /api/guilds/join
// @desc    Student joins a Guild via Code
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
        console.error("Join Guild Error:", err.message);
        res.status(500).json({ message: "Error joining guild" });
    }
});

// @route   GET /api/guilds/my-guilds
// @desc    Get all guilds the logged-in user belongs to
router.get('/my-guilds', protect, async (req, res) => {
    try {
        // Find any guild where the user's ID exists in the "members" array
        const userGuilds = await Guild.find({ members: req.user.id });
        res.json(userGuilds);
    } catch (err) {
        console.error("Fetch Guilds Error:", err.message);
        res.status(500).json({ message: "Server error fetching guilds" });
    }
});

//Guild Hall Path (Instructor Only)
router.put('/:guildId/path', protect, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.guildId);

    if (!guild) return res.status(404).json({ message: "Guild not found" });

    // Verify the person saving is the actual instructor
    if (guild.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only the Guild Master can edit the Hall" });
    }

    // Update the problems array
    guild.problems = req.body.problems; 
    await guild.save();

    res.json({ message: "Guild Hall Path updated successfully!", problems: guild.problems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating hall" });
  }
});

module.exports = router;