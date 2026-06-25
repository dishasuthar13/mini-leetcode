const express = require('express');
const router = express.Router();
const { explainCode, reviewCode, getHint } = require('../controllers/aiController');
const protect = require('../middleware/authMiddleware');

router.post('/explain', protect, explainCode);
router.post('/review', protect, reviewCode);
router.post('/hint', protect, getHint);

module.exports = router;