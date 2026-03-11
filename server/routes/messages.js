const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// GET INBOX (Fetch all messages involving the user)
router.get('/inbox', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
    .sort({ createdAt: -1 })
    .populate('sender receiver', 'username characterIndex');

    res.json(messages || []);
  } catch (err) {
    res.status(500).json({ message: "Failed to load inbox" });
  }
});

// FIX: Changed 'recipient' to 'receiver' to match your Schema
router.get('/unread-count', protect, async (req, res) => {
  try {
    const count = await Message.countDocuments({ 
      receiver: req.user._id, 
      isRead: false // CHANGED FROM read
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// NEW: Fetch the 5 most recent unread alerts for the dropdown
router.get('/notifications', protect, async (req, res) => {
  try {
    const alerts = await Message.find({ 
      receiver: req.user._id, 
      isRead: false // CHANGED FROM read
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('sender', 'username');

    console.log(`📬 Found ${alerts.length} unread alerts for ${req.user.username}`);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

// NEW: Mark all messages from a specific dropdown as read (Clear All)
router.post('/clear-alerts', protect, async (req, res) => {
  try {
    await Message.updateMany(
      { receiver: req.user._id, isRead: false }, // CHANGED FROM read
      { $set: { isRead: true } } // CHANGED FROM read
    );
    res.json({ message: "Alerts cleared" });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
});

// SEND MESSAGE
router.post('/send', protect, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content) {
      return res.status(400).json({ message: "Receiver ID and content are required" });
    }

    const newMessage = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content,
      read: false // Explicitly set to false for new messages
    });

    await newMessage.save();
    await newMessage.populate('sender receiver', 'username characterIndex');
    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Message failed to send" });
  }
});

router.post('/delete-bulk', protect, async (req, res) => {
  try {
    const { targetUserIds } = req.body; // Array of IDs to clear
    const myId = req.user._id;

    await Message.deleteMany({
      $or: [
        { sender: myId, receiver: { $in: targetUserIds } },
        { receiver: myId, sender: { $in: targetUserIds } }
      ]
    });

    res.json({ message: "Conversations trashed" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;