require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 1. Improved CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) 
    : true, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. FIXED: Explicitly handle OPTIONS requests (Preflight)
// Using (.*) instead of * to prevent the PathError crash in Express 4/5
app.options('(.*)', cors()); 

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check for Railway monitoring
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 3. Port must use process.env.PORT for Railway networking
// Ensure your Railway service settings are also set to port 8080
const PORT = process.env.PORT || 8080; 
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});