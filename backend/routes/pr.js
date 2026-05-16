const express = require('express');
const router = express.Router();
const { createPR } = require('../controllers/prController');

router.post('/', createPR);

module.exports = router;