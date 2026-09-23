const githubService = require('../services/githubService');
const parserService = require('../services/parserService');
const bobService = require('../services/bobService');
const groqService = require('../services/groqService');

const getRepoSummary = async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        error: 'repoUrl is required'
      });
    }

    console.log('📦 Fetching repository...');
    const repoFiles = await githubService.fetchRepoFiles(repoUrl);

    console.log('🔍 Parsing repository...');
    const parsedRepo = parserService.parseRepo(repoFiles);

    // Make sure these values are always available
    const totalFiles = parsedRepo.files?.length || 0;

    const structure =
      parsedRepo.structure ||
      parsedRepo.files?.map(file => file.path).join('\n') ||
      'No file structure available';

    console.log(`📁 Total files: ${totalFiles}`);

    console.log('📝 Preparing repository summary...');
    const bobSummary = bobService.generateRepoSummary(parsedRepo);

    console.log('⚡ Generating AI explanation...');
    const plainSummary = await groqService.explainRepo(
      parsedRepo,
      bobSummary
    );

    res.json({
      success: true,

      // AI-generated repository summary
      summary: bobSummary,

      // OpenRouter AI explanation
      plainSummary,

      // Repository information
      totalFiles,
      structure
    });

  } catch (error) {
    console.error(
      'Repository summary error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      error: error.response?.data?.error?.message || error.message
    });
  }
};

module.exports = {
  getRepoSummary
};