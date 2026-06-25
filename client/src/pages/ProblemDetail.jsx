import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import api from '../api/axios';
import CodeEditor from '../components/CodeEditor';

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'cpp', label: 'C++' },
];

const verdictStyles = {
  Accepted: 'bg-green-50 text-green-700 border-green-200',
  'Wrong Answer': 'bg-red-50 text-red-700 border-red-200',
  'Runtime Error': 'bg-red-50 text-red-700 border-red-200',
  'Time Limit Exceeded': 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const ProblemDetail = () => {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(null);

  useEffect(() => {
    api.get(`/problems/${slug}`)
      .then((res) => setProblem(res.data))
      .catch(() => setError('Could not load problem'));
  }, [slug]);

  useEffect(() => {
    if (!problem) return;
    const saved = localStorage.getItem(`code:${slug}:${language}`);
    setCode(saved ?? problem.starterCode?.[language] ?? '');
  }, [problem, slug, language]);

  const handleCodeChange = (value) => {
    setCode(value);
    localStorage.setItem(`code:${slug}:${language}`, value);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    setSubmission(null);
    try {
      const { data } = await api.post('/execute/run', { language, code, input: customInput });
      setOutput(data);
    } catch (err) {
      setOutput({ stderr: err.response?.data?.message || 'Execution failed', exitCode: 1 });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setOutput(null);
    setSubmission(null);
    try {
      const { data } = await api.post('/submissions', { problemId: problem._id, language, code });
      setSubmission(data);
    } catch (err) {
      setSubmission({ verdict: 'Wrong Answer', testResults: [], errorMessage: err.response?.data?.message || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAI = async (type) => {
    setAiLoading(type);
    setAiResult(null);
    try {
      if (type === 'explain') {
        const { data } = await api.post('/ai/explain', { code, language });
        setAiResult({ type, content: data.explanation });
      } else if (type === 'review') {
        const { data } = await api.post('/ai/review', { code, language });
        setAiResult({ type, content: data.review });
      } else if (type === 'hint') {
        const { data } = await api.post('/ai/hint', { problemId: problem._id, code });
        setAiResult({ type, content: data.hint });
      }
    } catch (err) {
      setAiResult({ type, content: err.response?.data?.message || 'AI request failed' });
    } finally {
      setAiLoading(null);
    }
  };

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!problem) return <p className="p-6">Loading...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{problem.title}</h1>
        <p className="text-sm font-semibold text-gray-500 mb-4">{problem.difficulty}</p>
        <p className="mb-4 whitespace-pre-line">{problem.description}</p>

        {problem.examples?.map((ex, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-4 mb-3">
            <p><span className="font-semibold">Input:</span> {ex.input}</p>
            <p><span className="font-semibold">Output:</span> {ex.output}</p>
            {ex.explanation && <p><span className="font-semibold">Explanation:</span> {ex.explanation}</p>}
          </div>
        ))}

        {problem.constraints?.length > 0 && (
          <div className="mt-4">
            <h2 className="font-semibold mb-1">Constraints</h2>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {problem.constraints.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border rounded px-2 py-1 text-sm">
            {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={handleRun} disabled={running || submitting} className="bg-gray-700 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">
              {running ? 'Running...' : 'Run'}
            </button>
            <button onClick={handleSubmit} disabled={running || submitting} className="bg-green-600 text-white px-4 py-1.5 rounded text-sm disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>

        <div className="border rounded overflow-hidden mb-3">
          <CodeEditor language={language} code={code} onChange={handleCodeChange} />
        </div>

        <div className="flex gap-2 mb-3">
          <button onClick={() => handleAI('explain')} disabled={!!aiLoading} className="flex items-center gap-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-md font-medium disabled:opacity-50">
            <Sparkles className="w-3.5 h-3.5" /> {aiLoading === 'explain' ? 'Thinking...' : 'Explain'}
          </button>
          <button onClick={() => handleAI('review')} disabled={!!aiLoading} className="flex items-center gap-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-md font-medium disabled:opacity-50">
            <Sparkles className="w-3.5 h-3.5" /> {aiLoading === 'review' ? 'Thinking...' : 'Review'}
          </button>
          <button onClick={() => handleAI('hint')} disabled={!!aiLoading} className="flex items-center gap-1.5 text-sm bg-purple-50 text-purple-700 hover:bg-purple-100 px-3 py-1.5 rounded-md font-medium disabled:opacity-50">
            <Sparkles className="w-3.5 h-3.5" /> {aiLoading === 'hint' ? 'Thinking...' : 'Hint'}
          </button>
        </div>

        {aiResult && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm text-gray-800 whitespace-pre-line mb-3">
            <p className="font-semibold text-purple-700 mb-1 capitalize">{aiResult.type}</p>
            {aiResult.content}
          </div>
        )}

        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder="Custom input (stdin) — only used by Run"
          className="w-full border rounded p-2 text-sm font-mono mb-3"
          rows={2}
        />

        {output && (
          <div className="bg-gray-900 text-gray-100 rounded p-3 text-sm font-mono whitespace-pre-wrap mb-3">
            {output.timedOut && <p className="text-yellow-400">Time limit exceeded</p>}
            {output.stdout && <pre>{output.stdout}</pre>}
            {output.stderr && <pre className="text-red-400">{output.stderr}</pre>}
            <p className="text-gray-500 mt-2">Exit code: {output.exitCode} {output.timeMs ? `· ${output.timeMs}ms` : ''}</p>
          </div>
        )}

        <Link to={`/submissions?problemId=${problem._id}`} className="text-xs text-blue-600 hover:underline mb-3 inline-block">
          View my submissions for this problem →
        </Link>

        {submission && (
          <div className={`border rounded-lg p-4 ${verdictStyles[submission.verdict] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
            <p className="font-bold text-lg">{submission.verdict}</p>
            {submission.errorMessage && <p className="text-sm mt-1">{submission.errorMessage}</p>}
            {submission.runtimeMs != null && <p className="text-sm text-gray-500 mt-1">Runtime: {submission.runtimeMs}ms</p>}
            {submission.testResults?.length > 0 && (
              <div className="mt-3 space-y-2">
                {submission.testResults.map((t, i) => (
                  <div key={i} className="bg-white rounded p-2 text-sm">
                    <p className="font-semibold">{t.isHidden ? `Hidden test ${i + 1}` : `Test ${i + 1}`} — {t.passed ? '✓ Passed' : '✗ Failed'}</p>
                    {!t.isHidden && (
                      <>
                        <p>Input: <code>{t.input}</code></p>
                        <p>Expected: <code>{t.expected}</code></p>
                        <p>Got: <code>{t.actual}</code></p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail;