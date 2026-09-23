
const {
  analyzeBug,
  generateFix
} = require('../services/groqService');

const {
  generateRepoContext
} = require('../services/bobService');


// Analyze bug using Grok
const analyzeBugController = async (req, res) => {
  try {
    const {
      parsedRepo,
      bugDescription
    } = req.body;

    if (!parsedRepo) {
      return res.status(400).json({
        success: false,
        message: 'Repository data is required.'
      });
    }

    if (!bugDescription) {
      return res.status(400).json({
        success: false,
        message: 'Bug description is required.'
      });
    }

    const repoContext = generateRepoContext(
      parsedRepo,
      bugDescription
    );

    const analysis = await analyzeBug(
      parsedRepo,
      repoContext,
      bugDescription
    );

    res.json({
      success: true,
      analysis
    });

  } catch (error) {
    console.error(
      'Bug analysis error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: 'Failed to analyze bug.',
      error:
        error.response?.data?.error?.message ||
        error.message
    });
  }
};


// Generate bug fix using Grok
const generateFixController = async (req, res) => {
  try {
    const {
      fileContent,
      bugDescription,
      language
    } = req.body;

    if (!fileContent) {
      return res.status(400).json({
        success: false,
        message: 'File content is required.'
      });
    }

    if (!bugDescription) {
      return res.status(400).json({
        success: false,
        message: 'Bug description is required.'
      });
    }

    const result = await generateFix(
      fileContent,
      bugDescription,
      language || 'javascript'
    );

    res.json({
      success: true,
      result
    });

  } catch (error) {
    console.error(
      'Fix generation error:',
      error.response?.data || error.message
    );

    res.status(500).json({
      success: false,
      message: 'Failed to generate fix.',
      error:
        error.response?.data?.error?.message ||
        error.message
    });
  }
};


// IMPORTANT:
// These names must match the existing routes/bugFix.js
module.exports = {
  analyzeBugController,
  generateFixController,
  getBugFix: generateFixController
};

