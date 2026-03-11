const mongoose = require('mongoose');

const DailyRotationSchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // Format: "YYYY-MM-DD"
  questIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TaskPool' }]
});

module.exports = mongoose.model('DailyRotation', DailyRotationSchema);