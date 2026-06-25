const Groq = require('groq-sdk');
const Problem = require('../models/Problem');

const ask = async (prompt) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set in .env');
  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
  });
  return completion.choices[0]?.message?.content || 'No response generated';
};

const explainCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    if (!code || code.trim().length < 5) {
      return res.status(400).json({ message: 'Write some code first.' });
    }
    const text = await ask(
      `Explain what this ${language || 'code'} does in plain beginner-friendly English.\n` +
      `Give a 2-3 sentence overview, then bullet points of the key steps.\n` +
      `Do not repeat the code back.\n\n${code}`
    );
    res.json({ explanation: text });
  } catch (error) {
    next(error);
  }
};

const reviewCode = async (req, res, next) => {
  try {
    const { code, language } = req.body;
    if (!code || code.trim().length < 5) {
      return res.status(400).json({ message: 'Write some code first.' });
    }
    const text = await ask(
      `Review this ${language || ''} code like a senior software engineer.\n` +
      `Cover: bugs or edge cases missed, time and space complexity, and optimization suggestions.\n` +
      `Be concise and specific. Use plain text with short labelled sections.\n\n${code}`
    );
    res.json({ review: text });
  } catch (error) {
    next(error);
  }
};

const getHint = async (req, res, next) => {
  try {
    const { problemId, code } = req.body;
    if (!problemId) return res.status(400).json({ message: 'problemId is required' });
    const problem = await Problem.findById(problemId).select('-testCases');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });
    const text = await ask(
      `A student is solving this coding problem:\n\n` +
      `Title: ${problem.title}\n` +
      `Description: ${problem.description}\n\n` +
      `Their current attempt:\n${code || '(no code written yet)'}\n\n` +
      `Give ONE helpful hint that nudges them toward the right approach.\n` +
      `Do NOT write any code or give away the full solution.\n` +
      `Keep it to 2-3 sentences maximum.`
    );
    res.json({ hint: text });
  } catch (error) {
    next(error);
  }
};

module.exports = { explainCode, reviewCode, getHint };