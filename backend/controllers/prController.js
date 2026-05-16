const githubService = require('../services/githubService');

const createPR = async (req, res) => {
  try {
    const { repoUrl, filePath, fixedCode, bugDescription } = req.body;

    if (!repoUrl || !filePath || !fixedCode || !bugDescription) {
      return res.status(400).json({ error: 'repoUrl, filePath, fixedCode and bugDescription are required' });
    }

    const result = await githubService.createFixPR(repoUrl, filePath, fixedCode, bugDescription);
    res.json({ success: true, ...result });

  } catch (error) {
    console.error('PR creation error:', error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.message || error.message });
  }
};

module.exports = { createPR };