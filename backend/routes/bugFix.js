const express = require('express');
const router = express.Router();
const { getBugFix } = require('../controllers/bugFixController');
router.post('/bugfix', getBugFix);

module.exports = router;
