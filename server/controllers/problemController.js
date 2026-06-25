const Problem = require('../models/Problem');

const getProblems = async (req, res, next) => {
  try {
    const problems = await Problem.find().select('title slug difficulty tags');
    res.json(problems);
  } catch (error) {
    next(error);
  }
};

const getProblemBySlug = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug }).select('-testCases');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (error) {
    next(error);
  }
};

const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json(problem);
  } catch (error) {
    next(error);
  }
};

const updateProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json(problem);
  } catch (error) {
    next(error);
  }
};

const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findOneAndDelete({ slug: req.params.slug });
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    res.json({ message: 'Problem deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProblems, getProblemBySlug, createProblem, updateProblem, deleteProblem };