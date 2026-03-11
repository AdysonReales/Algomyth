const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { protect } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
    // 1. ADDED skinColor and armorColor to the destructured body
    const { username, email, password, role, characterIndex, skinVariant, armorVariant } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const passwordRegex = /^(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters and include a number" });
        }

        let existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }

        let existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Save the customization colors (with fallbacks if they didn't pick one)
        const user = new User({ 
        username, 
        email, 
        password: hashedPassword, 
        role,
        characterIndex: characterIndex || 1,
        skinVariant: skinVariant || 'default',
        armorVariant: armorVariant || 'default'
        });
    
        await user.save();

        // --- NODEMAILER FAKE EMAIL LOGIC (TC-3) ---
        try {
            let testAccount = await nodemailer.createTestAccount();
            let transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user, 
                    pass: testAccount.pass, 
                },
            });

            let info = await transporter.sendMail({
                from: '"Algomyth System ⚔️" <noreply@algomyth.com>',
                to: email, 
                subject: "Welcome to Algomyth! Verify Your Account",
                html: `
                  <h2 style="color: #5d3a1a; font-family: monospace;">Welcome, ${username}!</h2>
                  <p>Your <b>${role}</b> account has been successfully created.</p>
                  <p>Click <a href="http://localhost:5173">here</a> to enter the world.</p>
                `,
            });

            console.log("\n✉️  EMAIL SENT!");
            console.log("👉 Click here to view it: %s\n", nodemailer.getTestMessageUrl(info));
        } catch (emailErr) {
            console.error("Failed to send test email:", emailErr);
        }
        // ------------------------------------------

        res.status(201).json({ message: "Account Created! Check your terminal for the email link." });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Populate inventory so the frontend doesn't crash on login
        const user = await User.findOne({ username }).populate('inventory.item');
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // Convert to a plain object so we can delete the password before sending
        const userObj = user.toObject();
        delete userObj.password;
        
        // Ensure achievements array exists to prevent frontend map errors
        if (!userObj.achievements) userObj.achievements = [];

        res.json({ 
            token, 
            user: userObj // Sends the full, accurate profile data
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password') 
      .populate('inventory.item');

    if (!user.achievements) {
      user.achievements = [];
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// server/routes/auth.js

router.post('/pin-achievement', protect, async (req, res) => {
  try {
    const { achKey, slotIndex } = req.body;
    const user = await User.findById(req.user.id);

    // 1. Ensure the array exists and has 5 slots
    if (!user.pinnedAchievements || user.pinnedAchievements.length !== 5) {
      user.pinnedAchievements = [null, null, null, null, null];
    }

    // 2. Set the key at the specific index
    user.pinnedAchievements[slotIndex] = achKey;

    // 3. Tell Mongoose specifically that this array index changed
    user.markModified('pinnedAchievements');
    
    await user.save();
    res.json({ message: "Badge pinned!", pinnedAchievements: user.pinnedAchievements });
  } catch (err) {
    console.error("Pin Error:", err);
    res.status(500).json({ message: "Failed to update display" });
  }
});
// server/routes/auth.js

router.post('/unpin-achievement', protect, async (req, res) => {
  try {
    const { slotIndex } = req.body; // e.g., 0 for the first slot
    const user = await User.findById(req.user.id);

    // Set the slot back to null
    user.pinnedAchievements[slotIndex] = null;
    
    user.markModified('pinnedAchievements');
    await user.save();

    res.json({ 
      message: "Badge removed from display", 
      pinnedAchievements: user.pinnedAchievements 
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove badge" });
  }
});

// SEARCH FOR PLAYER
router.get('/search/:query', protect, async (req, res) => {
  try {
    const query = req.params.query.replace('@', '').trim();
    
    // We EXPLICITLY add '_id' to the select string here
    const foundUser = await User.findOne({ 
      username: { $regex: new RegExp(`^${query}$`, 'i') } 
    }).select('_id username displayName stats characterIndex skinVariant armorVariant inventory pinnedAchievements settings');

    if (!foundUser) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Only try to populate if there are actually items in the inventory
    if (foundUser.inventory && foundUser.inventory.length > 0) {
      // We wrap this in a try/catch so a broken item doesn't crash the whole search
      try {
        await foundUser.populate('inventory.item');
      } catch (popError) {
        console.error("Population error (non-fatal):", popError);
      }
    }

    res.json(foundUser);
  } catch (err) {
    console.error("SEARCH CRASH:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put('/update-profile', protect, async (req, res) => {
  try {
    const { username, email, oldPassword, newPassword, skinVariant, armorVariant, characterIndex } = req.body;
    const user = await User.findById(req.user._id);

    // 1. Password Check
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Current password incorrect." });

    // 2. TRULY CHANGED? (Check against DB, not the frontend flag)
    const hasNewLook = 
      (skinVariant && skinVariant !== user.skinVariant) ||
      (armorVariant && armorVariant !== user.armorVariant) ||
      (characterIndex && characterIndex !== user.characterIndex);

    if (hasNewLook) {
      if (user.stats.gold < 2500) {
        return res.status(400).json({ message: "Need 2500 Gold for appearance changes!" });
      }
      user.stats.gold -= 2500;
    }

    if (username) user.username = username;
    if (email) user.email = email;
    if (skinVariant) user.skinVariant = skinVariant;
    if (armorVariant) user.armorVariant = armorVariant;
    if (characterIndex) user.characterIndex = characterIndex;

    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Update failed." });
  }
});

module.exports = router;