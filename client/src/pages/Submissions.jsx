import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import api from '../api/axios';

const VERDICT_COLOR = {
  'Accepted': '#10B981', 'Wrong Answer': '#EF4444',
  'Runtime Error': '#EF4444', 'Time Limit Exceeded': '#F59E0B',
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
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, background: 'rgba(99,102,241,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} color="#6366F1" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>Submissions</h1>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{submissions.length} total</p>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 64, borderRadius: 10 }} />)}
        </div>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📝</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>No submissions yet</div>
          <Link to="/problems" style={{
            display: 'inline-block', padding: '9px 20px',
            background: '#6366F1', color: 'white', borderRadius: 8,
            textDecoration: 'none', fontSize: 13, fontWeight: 600
          }}>Browse problems</Link>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 1fr', padding: '10px 20px', borderBottom: '1px solid var(--border)', gap: 12 }}>
            {['Problem', 'Lang', 'Time', 'Verdict'].map(h => (
              <span key={h} style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{h}</span>
            ))}
          </div>
          {submissions.map((s, i) => {
            const color = VERDICT_COLOR[s.verdict] || '#888';
            return (
              <motion.div key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 2fr 1fr', padding: '14px 20px', borderBottom: '1px solid var(--border)', gap: 12, alignItems: 'center', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <Link to={`/problems/${s.problem?.slug}`} style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', textDecoration: 'none' }}
                  onMouseEnter={e => e.target.style.color = '#6366F1'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
                >
                  {s.problem?.title}
                </Link>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{s.language}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleString()}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, color: color,
                  background: `${color}15`, border: `1px solid ${color}30`,
                  borderRadius: 6, padding: '3px 9px', textAlign: 'center',
                  fontFamily: 'JetBrains Mono', display: 'inline-block', width: 'fit-content'
                }}>{VERDICT_SHORT[s.verdict] || s.verdict}</span>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Submissions;