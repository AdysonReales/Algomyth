const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
// We define each prefix exactly ONCE.
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/problems', require('./routes/tasks')); 
app.use('/api/shop', require('./routes/shop'));
app.use('/api/guilds', require('./routes/guilds'));   // This handles /api/guilds
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/messages', require('./routes/messages')); // This handles /api/messages

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("⚔️ ALGOMYTH Database Connected!"))
  .catch(err => console.log("❌ DB CONNECTION FAILED:", err.message));

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));