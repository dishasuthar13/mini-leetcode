const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
  passed: { type: Boolean, required: true },
  isHidden: { type: Boolean, default: false },
  input: { type: String },
  expected: { type: String },
  actual: { type: String },
});

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    verdict: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded'],
      required: true,
    },
    testResults: [testResultSchema],
    runtimeMs: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Submission', submissionSchema);