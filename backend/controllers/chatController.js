const githubService = require('../services/githubService');
const parserService = require('../services/parserService');
const grokService = require('../services/groqService');
const repoContextService = require('../services/bobService');

const chatWithRepo = async (req, res) => {
  try {
    const {
      repoUrl,
      question,
      conversationHistory = []
    } = req.body;

    if (!repoUrl || !question) {
      return res.status(400).json({
        error: 'repoUrl and question are required'
      });
    }

    // Fetch repository
    const repoFiles =
      await githubService.fetchRepoFiles(repoUrl);

    // Parse repository
    const parsedRepo =
      parserService.parseRepo(repoFiles);

    // Generate repository context locally
    const repoContext =
      repoContextService.generateRepoContext(
        parsedRepo,
        question
      );

    // Send context + question to Grok
    const answer =
      await grokService.chatWithRepo(
        parsedRepo,
        repoContext,
        question,
        conversationHistory
      );

    const updatedHistory = [
      ...conversationHistory,
      {
        role: 'user',
        content: question
      },
      {
        role: 'assistant',
        content: answer
      }
    ];

    res.json({
      success: true,
      answer,
      conversationHistory: updatedHistory
    });

  } catch (error) {
    console.error(
      'Chat error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      error:
        error.response?.data?.error?.message ||
        error.message
    });
  }
};

module.exports = {
  chatWithRepo
};