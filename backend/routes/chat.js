const express = require('express');
const router = express.Router();
const { chatWithRepo } = require('../controllers/chatController');

router.post('/', chatWithRepo);

module.exports = router;
