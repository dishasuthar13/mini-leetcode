const express = require('express');
const router = express.Router();
const {
  getProblems,
  getProblemBySlug,
  createProblem,
  updateProblem,
  deleteProblem,
} = require('../controllers/problemController');
const protect = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/', protect, getProblems);
router.get('/:slug', protect, getProblemBySlug);
router.post('/', protect, admin, createProblem);
router.put('/:slug', protect, admin, updateProblem);
router.delete('/:slug', protect, admin, deleteProblem);

module.exports = router;