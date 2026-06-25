const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err.message?.includes('quota exceeded') || err.message?.includes('try again tomorrow')) {
    return res.status(429).json({ message: 'AI quota exceeded. Try again tomorrow.' });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;