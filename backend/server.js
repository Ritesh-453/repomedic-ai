require('dotenv').config();

const express = require('express');
const cors = require('cors');

const analyzeRoutes = require('./routes/analyze');
const chatRoutes = require('./routes/chat');
const bugFixRoutes = require('./routes/bugFix');
const repoSummaryRoutes = require('./routes/repoSummary');
const prRoutes = require('./routes/pr');

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'https://repomedic-ai.vercel.app'
}));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'RepoMedic API is running',
    ai: 'xAI Grok',
    model: process.env.GROK_MODEL || 'grok-4.7'
  });
});

// Routes
app.use('/api/analyze', analyzeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/bug-fix', bugFixRoutes);
app.use('/api/repo-summary', repoSummaryRoutes);
app.use('/api/pr', prRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('=================================');
  console.log('       RepoMedic API Server');
  console.log('=================================');
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`⚡ AI Engine: xAI Grok`);
  console.log(
    `🤖 Model: ${process.env.GROK_MODEL || 'grok-4.7'}`
  );
  console.log('=================================');
  console.log('');
});