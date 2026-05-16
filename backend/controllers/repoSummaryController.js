const githubService = require('../services/githubService');
const parserService = require('../services/parserService');
const bobService = require('../services/bobService');
const groqService = require('../services/groqService');

const getRepoSummary = async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required' });

    const repoFiles = await githubService.fetchRepoFiles(repoUrl);
    const parsedRepo = parserService.parseRepo(repoFiles);
    const bobSummary = bobService.generateRepoSummary(parsedRepo);

    // Use Groq to generate plain English explanation
    const plainSummary = await groqService.explainRepo(parsedRepo, bobSummary);

    res.json({
      success: true,
      summary: bobSummary,
      plainSummary,
      structure: parsedRepo.structure,
      totalFiles: parsedRepo.totalFiles
    });

  } catch (error) {
    console.error('Repo summary error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRepoSummary };