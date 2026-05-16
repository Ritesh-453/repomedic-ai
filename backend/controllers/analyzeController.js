const githubService = require('../services/githubService');
const parserService = require('../services/parserService');
const groqService = require('../services/groqService');
const bobService = require('../services/bobService');

// In-memory store (no MongoDB needed)
const analysisHistory = [];

const analyzeRepo = async (req, res) => {
  try {
    const { repoUrl, bugDescription } = req.body;

    if (!repoUrl || !bugDescription) {
      return res.status(400).json({ error: 'repoUrl and bugDescription are required' });
    }

    // Step 1: Fetch repo files via GitHub API
    console.log('📦 Fetching repository...');
    const repoFiles = await githubService.fetchRepoFiles(repoUrl);

    // Step 2: Parse and filter important files
    console.log('🔍 Parsing repository structure...');
    const parsedRepo = parserService.parseRepo(repoFiles);

    // Step 3: IBM BOB generates repo context
    console.log('🤖 IBM BOB analyzing repository context...');
    const bobContext = bobService.generateRepoContext(parsedRepo, bugDescription);

    // Step 4: Groq AI performs bug reasoning
    console.log('⚡ Groq AI analyzing bug...');
    const analysis = await groqService.analyzeBug(parsedRepo, bobContext, bugDescription);

    // Store in memory
    const result = {
      id: Date.now(),
      repoUrl,
      bugDescription,
      analysis,
      createdAt: new Date().toISOString()
    };
    analysisHistory.push(result);

    res.json({ success: true, ...analysis, id: result.id });

  } catch (error) {
    console.error('Analyze error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

const getHistory = (req, res) => {
  res.json({ success: true, history: analysisHistory.slice(-10) });
};

module.exports = { analyzeRepo, getHistory };
