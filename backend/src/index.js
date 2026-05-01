require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// 1. Improved CORS configuration to handle preflight requests
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim()) 
    : true, // Changing '*' to 'true' helps with credentials/cookies
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 2. Explicitly handle OPTIONS requests (Preflight)
app.options('*', cors()); 

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api', require('./routes/tasks'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check for Railway monitoring
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// 3. Port must use process.env.PORT for Railway networking
const PORT = process.env.PORT || 8080; 
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});