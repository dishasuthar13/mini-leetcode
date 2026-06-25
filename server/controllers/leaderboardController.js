const Submission = require('../models/Submission');
const User = require('../models/User');

const getLeaderboard = async (req, res, next) => {
  try {
    const results = await Submission.aggregate([
      { $match: { verdict: 'Accepted' } },
      { $group: { _id: { user: '$user', problem: '$problem' } } },
      { $lookup: { from: 'problems', localField: '_id.problem', foreignField: '_id', as: 'problem' } },
      { $unwind: { path: '$problem', preserveNullAndEmpty: false } },
      {
        $group: {
          _id: '$_id.user',
          solvedCount: { $sum: 1 },
          xp: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$problem.difficulty', 'Easy'] }, then: 10 },
                  { case: { $eq: ['$problem.difficulty', 'Medium'] }, then: 20 },
                  { case: { $eq: ['$problem.difficulty', 'Hard'] }, then: 40 },
                ],
                default: 0,
              },
            },
          },
        },
      },
      { $sort: { xp: -1, solvedCount: -1 } },
      { $limit: 50 },
    ]);

    const userIds = results.map((r) => r._id);
    const users = await User.find({ _id: { $in: userIds } }).select('name');
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const leaderboard = results.map((r, index) => ({
      rank: index + 1,
      userId: String(r._id),
      name: userMap.get(String(r._id))?.name || 'Unknown',
      solvedCount: r.solvedCount,
      xp: r.xp,
    }));

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

module.exports = { getLeaderboard };