const express = require('express');
const router = express.Router();
const { getRepoSummary } = require('../controllers/repoSummaryController');

router.post('/', getRepoSummary);

module.exports = router;
