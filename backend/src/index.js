require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 1. Standard CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) 
    : true,
  credentials: true,
}));

// 2. The "Safe" way to handle OPTIONS requests (Preflight)
// This avoids the (.*) syntax that caused your PathError crash
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check for Railway monitoring
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 3. Port Configuration
// Matches your Railway dashboard networking setting
const PORT = process.env.PORT || 8080; 
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});