import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import api from '../api/axios';

const VERDICT_COLOR = {
  'Accepted': 'var(--green)', 'Wrong Answer': 'var(--red)',
  'Runtime Error': 'var(--red)', 'Time Limit Exceeded': 'var(--amber)',
};
const VERDICT_SHORT = {
  'Accepted': 'AC', 'Wrong Answer': 'WA',
  'Runtime Error': 'RE', 'Time Limit Exceeded': 'TLE',
};

const Submissions = () => {
  const [searchParams] = useSearchParams();
  const problemId = searchParams.get('problemId');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(problemId ? `/submissions?problemId=${problemId}` : '/submissions')
      .then(r => setSubmissions(r.data)).finally(() => setLoading(false));
  }, [problemId]);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 860 }}>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={15} color="var(--accent)" />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Submissions</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{submissions.length} total</p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 9 }} />)}
        </div>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <Clock size={32} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>No submissions yet</div>
          <Link to="/problems" className="btn-primary" style={{ display: 'inline-block' }}>Browse problems</Link>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 80px', padding: '10px 18px', borderBottom: '1px solid var(--border)', gap: 12 }}>
            {['Problem', 'Language', 'Submitted', 'Result'].map(h => <span key={h} className="label">{h}</span>)}
          </div>
          {submissions.map((s, i) => {
            const color = VERDICT_COLOR[s.verdict] || 'var(--text-muted)';
            return (
              <motion.div key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                style={{
                  display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 80px',
                  alignItems: 'center', padding: '13px 18px',
                  borderBottom: '1px solid var(--border)', gap: 12,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Link to={`/problems/${s.problem?.slug}`}
                  style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', transition: 'color 0.12s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
                >
                  {s.problem?.title}
                </Link>
                <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.language}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {new Date(s.createdAt).toLocaleString()}
                </span>
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 700, color,
                  background: `${color}18`,
                  borderRadius: 5, padding: '3px 8px',
                  display: 'inline-block', textAlign: 'center',
                }}>{VERDICT_SHORT[s.verdict] || '—'}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Submissions;