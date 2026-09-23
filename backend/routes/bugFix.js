const express = require('express');
const router = express.Router();
const { getBugFix } = require('../controllers/bugFixController');

router.post('/', getBugFix);  

module.exports = router;