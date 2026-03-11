const express = require('express');
const router = express.Router();
const Achievement = require('../models/Achievement');

router.get('/', async (req, res) => {
  try {
    const list = await Achievement.find().sort({ requirementValue: 1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Error fetching achievements" });
  }
});

module.exports = router;