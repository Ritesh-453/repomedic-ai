const githubService = require('../services/githubService');
const parserService = require('../services/parserService');
const groqService = require('../services/groqService');
const bobService = require('../services/bobService');

const chatWithRepo = async (req, res) => {
  try {
    const { repoUrl, question, conversationHistory = [] } = req.body;

    if (!repoUrl || !question) {
      return res.status(400).json({ error: 'repoUrl and question are required' });
    }

    const repoFiles = await githubService.fetchRepoFiles(repoUrl);
    const parsedRepo = parserService.parseRepo(repoFiles);
    const bobContext = bobService.generateRepoContext(parsedRepo, question);
    const answer = await groqService.chatWithRepo(parsedRepo, bobContext, question, conversationHistory);

    const updatedHistory = [
      ...conversationHistory,
      { role: 'user', content: question },
      { role: 'assistant', content: answer }
    ];

    res.json({ success: true, answer, conversationHistory: updatedHistory });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { chatWithRepo };
