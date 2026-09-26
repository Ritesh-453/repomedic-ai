const { generateRepoContext, getRelevantFiles } = require('../services/bobService');
const githubService = require('../services/githubService');
const parserService = require('../services/parserService');
const grokService = require('../services/groqService');
const repoContextService = require('../services/bobService');

// In-memory store
const analysisHistory = [];

const analyzeRepo = async (req, res) => {
  try {
    const { repoUrl, bugDescription } = req.body;

    if (!repoUrl || !bugDescription) {
      return res.status(400).json({
        error: 'repoUrl and bugDescription are required'
      });
    }

   // Step 1: Fetch repository files
console.log('📦 Fetching repository...');
const repoFiles = await githubService.fetchRepoFiles(repoUrl);

// Step 2: Parse repository
console.log('🔍 Parsing repository structure...');
const parsedRepo = parserService.parseRepo(repoFiles);

// Step 3: Generate repository context locally
console.log('🔎 Preparing repository context...');
const repoContext = repoContextService.generateRepoContext(parsedRepo, bugDescription);

// Step 4: Grok performs AI bug analysis
console.log('⚡ Grok AI analyzing bug...');
const relevantFiles = repoContextService.getRelevantFiles(parsedRepo, bugDescription, 8);
const analysis = await grokService.analyzeBug(parsedRepo, repoContext, bugDescription, relevantFiles);

    // Store analysis in memory
    const result = {
      id: Date.now(),
      repoUrl,
      bugDescription,
      analysis,
      createdAt: new Date().toISOString()
    };

    analysisHistory.push(result);

    res.json({
      success: true,
      ...analysis,
      id: result.id
    });

  } catch (error) {
    console.error(
      'Analyze error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message
    });
  }
};

const getHistory = (req, res) => {
  res.json({
    success: true,
    history: analysisHistory.slice(-10)
  });
  console.log('📊 ANALYSIS TYPE:', typeof analysis);
  console.log('📊 ANALYSIS KEYS:', Object.keys(analysis || {}));
};

module.exports = {
  analyzeRepo,
  getHistory
};