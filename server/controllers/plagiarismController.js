const Submission = require('../models/Submission');
const { jaccardSimilarity } = require('../utils/similarity');

const checkPlagiarism = async (req, res, next) => {
  try {
    const { problemId } = req.params;
    const submissions = await Submission.find({ problem: problemId, verdict: 'Accepted' })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const latestByUser = new Map();
    for (const s of submissions) {
      if (!latestByUser.has(String(s.user._id))) latestByUser.set(String(s.user._id), s);
    }
    const unique = [...latestByUser.values()];

    const pairs = [];
    for (let i = 0; i < unique.length; i++) {
      for (let j = i + 1; j < unique.length; j++) {
        const score = jaccardSimilarity(unique[i].code, unique[j].code);
        if (score > 0.6) {
          pairs.push({ userA: unique[i].user.name, userB: unique[j].user.name, similarity: Math.round(score * 100) });
        }
      }
    }

    pairs.sort((a, b) => b.similarity - a.similarity);
    res.json(pairs);
  } catch (error) {
    next(error);
  }
};

module.exports = { checkPlagiarism };