const runCode = require('../utils/runCode');

const executeCode = async (req, res, next) => {
  try {
    const { language, code, input } = req.body;
    if (!language || !code) {
      return res.status(400).json({ message: 'language and code are required' });
    }
    const result = await runCode({ language, code, input: input || '' });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { executeCode };