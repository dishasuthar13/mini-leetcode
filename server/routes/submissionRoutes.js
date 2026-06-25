const express = require('express');
const router = express.Router();
const { createSubmission, getMySubmissions, getStats } = require('../controllers/submissionController');
const { checkPlagiarism } = require('../controllers/plagiarismController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.post('/', protect, createSubmission);
router.get('/stats', protect, getStats);
router.get('/plagiarism/:problemId', protect, admin, checkPlagiarism);
router.get('/', protect, getMySubmissions);

module.exports = router;