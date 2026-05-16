const groqService = require('../services/groqService');

const getBugFix = async (req, res) => {
  try {
    const { fileContent, bugDescription, language } = req.body;
    if (!fileContent || !bugDescription) {
      return res.status(400).json({ error: 'fileContent and bugDescription are required' });
    }

    const fix = await groqService.generateFix(fileContent, bugDescription, language);
    res.json({ success: true, ...fix });

  } catch (error) {
    console.error('Bug fix error:', error.message);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getBugFix };