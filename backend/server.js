const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ 
  origin: ['http://localhost:3000', 'https://repomedic-ai.vercel.app'] 
}));
app.use(express.json());

// Routes
app.use('/api/analyze', require('./routes/analyze'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/repo-summary', require('./routes/repoSummary'));
app.use('/api', require('./routes/bugFix'));

// Health check
app.get('/health', (req, res) => res.json({ 
  status: 'OK', 
  message: '🚀 RepoMedic API running',
  ai: 'Groq (llama3-70b)',
  contextEngine: 'IBM BOB'
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 RepoMedic server running on http://localhost:${PORT}`);
  console.log(`⚡ AI Engine: Groq llama3-70b`);
  console.log(`🤖 Context Engine: IBM BOB`);
});
