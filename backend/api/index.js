require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', require('../src/routes/auth'));
app.use('/api/projects', require('../src/routes/projects'));
app.use('/api', require('../src/routes/tasks'));
app.use('/api/dashboard', require('../src/routes/dashboard'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
