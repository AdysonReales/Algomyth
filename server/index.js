const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); 

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://algomyth.vercel.app" // Replace this with your actual Vercel URL!
  ],
  credentials: true
}));
app.use(express.json());

// --- ROUTES ---
// We import and use them directly to avoid "Variable Not Defined" errors.
app.use('/api/auth', require('./routes/auth'));

// This handles your Solo Area, Dailies, and the Problem Library for the Instructor
app.use('/api/tasks', require('./routes/tasks'));

// Legacy support: In case your frontend still calls /api/problems, we point it to the same file
app.use('/api/problems', require('./routes/tasks')); 

app.use('/api/shop', require('./routes/shop'));
app.use('/api/guilds', require('./routes/guilds'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/messages', require('./routes/messages'));

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("⚔️ ALGOMYTH Database Connected!"))
  .catch(err => console.log("❌ DB CONNECTION FAILED:", err.message));

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));