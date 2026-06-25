const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const runCode = require('../utils/runCode');

const buildDriver = (userCode, functionName, args) => {
  return `${userCode}\n\nconst __args = ${JSON.stringify(args)};\nconst __result = ${functionName}(...__args);\nconsole.log(JSON.stringify(__result));`;
};

const normalize = (str) => {
  try {
    return JSON.stringify(JSON.parse(String(str).trim()));
  } catch {
    return String(str).trim();
  }
};

const createSubmission = async (req, res, next) => {
  try {
    const { problemId, language, code } = req.body;
    if (!problemId || !language || !code) {
      return res.status(400).json({ message: 'problemId, language and code are required' });
    }
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    if (language !== 'javascript') {
      return res.status(400).json({ message: `${language} grading requires Docker, coming soon. Use JavaScript for now.` });
    }
    const testResults = [];
    let verdict = 'Accepted';
    let totalRuntime = 0;
    for (const testCase of problem.testCases) {
      const args = JSON.parse(testCase.input);
      const driver = buildDriver(code, problem.functionName, args);
      const result = await runCode({ language, code: driver, input: '' });
      totalRuntime += result.timeMs || 0;
      if (result.timedOut) {
        verdict = 'Time Limit Exceeded';
        testResults.push({ passed: false, isHidden: testCase.isHidden, input: testCase.isHidden ? null : testCase.input, expected: testCase.isHidden ? null : testCase.output, actual: null });
        break;
      }
      if (result.exitCode !== 0) {
        verdict = 'Runtime Error';
        testResults.push({ passed: false, isHidden: testCase.isHidden, input: testCase.isHidden ? null : testCase.input, expected: testCase.isHidden ? null : testCase.output, actual: testCase.isHidden ? null : result.stderr.slice(0, 500) });
        break;
      }
      const passed = normalize(result.stdout) === normalize(testCase.output);
      testResults.push({
        passed,
        isHidden: testCase.isHidden,
        input: testCase.isHidden ? null : testCase.input,
        expected: testCase.isHidden ? null : testCase.output,
        actual: testCase.isHidden ? null : result.stdout.trim(),
      });
      if (!passed) {
        verdict = 'Wrong Answer';
        break;
      }
    }
    const submission = await Submission.create({
      user: req.user._id,
      problem: problem._id,
      language,
      code,
      verdict,
      testResults,
      runtimeMs: totalRuntime,
    });
    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};

const getMySubmissions = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.problemId) filter.problem = req.query.problemId;
    const submissions = await Submission.find(filter)
      .populate('problem', 'title slug')
      .sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title slug difficulty');
    const totalSubmissions = submissions.length;
    const accepted = submissions.filter(s => s.verdict === 'Accepted').length;
    const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    const seen = new Set();
    submissions.forEach(s => {
      if (s.verdict === 'Accepted' && s.problem && !seen.has(String(s.problem._id))) {
        seen.add(String(s.problem._id));
        solvedByDifficulty[s.problem.difficulty] = (solvedByDifficulty[s.problem.difficulty] || 0) + 1;
      }
    });
    const days = new Set(submissions.map(s => new Date(s.createdAt).toISOString().split('T')[0]));
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      if (days.has(d.toISOString().split('T')[0])) streak++;
      else if (i > 0) break;
    }
    const xp = solvedByDifficulty.Easy * 10 + solvedByDifficulty.Medium * 20 + solvedByDifficulty.Hard * 40;
    const recentSubmissions = [...submissions].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
    res.json({
      totalSubmissions, accepted,
      solvedCount: seen.size,
      solvedByDifficulty,
      xp, streak,
      recommendedDifficulty: solvedByDifficulty.Easy < 5 ? 'Easy' : solvedByDifficulty.Medium < 4 ? 'Medium' : 'Hard',
      recentSubmissions,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSubmission, getMySubmissions, getStats };