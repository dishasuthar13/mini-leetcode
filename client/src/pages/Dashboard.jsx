import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, CheckCircle2, TrendingUp, BookOpen, Zap } from 'lucide-react';
import api from '../api/axios';

const ProgressBar = ({ label, solved, total, color }) => (
  <div style={{ marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
      <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{solved}/{total}</span>
    </div>
    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${total ? Math.min((solved / total) * 100, 100) : 0}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: 2 }}
      />
    </div>
  </div>
);

const SolvedRing = ({ solved, total }) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const progress = total ? (solved / total) * circ : 0;
  return (
    <div style={{ position: 'relative', width: 130, height: 130, flexShrink: 0 }}>
      <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--border)" strokeWidth="7" />
        <motion.circle
          cx="65" cy="65" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent)" />
            <stop offset="100%" stopColor="var(--green)" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{solved}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>of {total}</div>
      </div>
    </div>
  );
};

const Heatmap = ({ submissions }) => {
  const counts = {};
  submissions.forEach(s => {
    const d = new Date(s.createdAt).toISOString().split('T')[0];
    counts[d] = (counts[d] || 0) + 1;
  });
  const weeks = [];
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 363);
  start.setDate(start.getDate() - start.getDay());
  for (let w = 0; w < 53; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + w * 7 + d);
      const key = dt.toISOString().split('T')[0];
      week.push({ key, count: counts[key] || 0 });
    }
    weeks.push(week);
  }
  const getColor = (n) => {
    if (n === 0) return 'var(--bg-elevated)';
    if (n === 1) return '#1a3a2a';
    if (n <= 3) return '#166534';
    return 'var(--green)';
  };
  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ display: 'flex', gap: 3, width: 'max-content' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map(day => (
              <div key={day.key} title={`${day.key}: ${day.count}`}
                style={{ width: 11, height: 11, borderRadius: 2, background: getColor(day.count), border: '1px solid rgba(255,255,255,0.03)' }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Less</span>
        {['var(--bg-elevated)', '#1a3a2a', '#166534', 'var(--green)'].map((c, i) => (
          <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: c, border: '1px solid rgba(255,255,255,0.03)' }} />
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
};

const VERDICT_COLOR = {
  'Accepted': 'var(--green)',
  'Wrong Answer': 'var(--red)',
  'Runtime Error': 'var(--red)',
  'Time Limit Exceeded': 'var(--amber)',
};

const VERDICT_SHORT = {
  'Accepted': 'AC', 'Wrong Answer': 'WA',
  'Runtime Error': 'RE', 'Time Limit Exceeded': 'TLE',
};

const Dashboard = () => {
  const { user } = useAuth();
  const { stats } = useOutletContext() || {};
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    Promise.all([api.get('/submissions'), api.get('/problems')])
      .then(([s, p]) => { setSubmissions(s.data); setProblems(p.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalProblems = problems.length;
  const solvedCount = stats?.solvedCount || 0;
  const xp = stats?.xp || 0;
  const acceptanceRate = stats?.totalSubmissions > 0
    ? Math.round((stats.accepted / stats.totalSubmissions) * 100) : 0;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1060 }}>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div className="mono label" style={{ color: 'var(--accent)', marginBottom: 6 }}>
          {greet}
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          {user?.name}
        </h1>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { icon: CheckCircle2, label: 'Problems Solved', value: solvedCount, color: 'var(--accent)' },
          { icon: TrendingUp, label: 'Acceptance Rate', value: `${acceptanceRate}%`, color: 'var(--green)' },
          { icon: BookOpen, label: 'Submissions', value: stats?.totalSubmissions || 0, color: 'var(--text-secondary)' },
          { icon: Zap, label: 'XP Earned', value: xp, color: 'var(--amber)' },
        ].map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="card" style={{ padding: '18px 20px' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>{item.label}</div>
                <div className="mono" style={{ fontSize: 26, fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
              </div>
              <div style={{ padding: 8, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <item.icon size={15} color={item.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 12, marginBottom: 12 }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <SolvedRing solved={solvedCount} total={totalProblems} />
            <div style={{ flex: 1 }}>
              <div className="label" style={{ marginBottom: 16 }}>Progress by difficulty</div>
              <ProgressBar label="Easy" solved={stats?.solvedByDifficulty?.Easy || 0} total={20} color="var(--green)" />
              <ProgressBar label="Medium" solved={stats?.solvedByDifficulty?.Medium || 0} total={21} color="var(--amber)" />
              <ProgressBar label="Hard" solved={stats?.solvedByDifficulty?.Hard || 0} total={9} color="var(--red)" />
            </div>
          </div>
          {stats?.recommendedDifficulty && (
            <div style={{
              background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
              borderRadius: 8, padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 2 }}>Recommended next</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                  Try <strong style={{ color: 'var(--text-primary)' }}>{stats.recommendedDifficulty}</strong> problems to level up
                </div>
              </div>
              <Link to="/problems" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                Browse <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="label">Recent submissions</div>
            <Link to="/submissions" style={{ fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 3 }}>
              View all <ArrowRight size={11} />
            </Link>
          </div>
          {submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 13, marginBottom: 8 }}>No submissions yet</div>
              <Link to="/problems" style={{ fontSize: 12, color: 'var(--accent)' }}>Solve your first problem</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {submissions.slice(0, 7).map(s => {
                const color = VERDICT_COLOR[s.verdict] || 'var(--text-muted)';
                return (
                  <Link key={s._id} to={`/problems/${s.problem?.slug}`}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 7,
                      background: 'var(--bg-elevated)',
                      border: '1px solid transparent',
                      transition: 'border-color 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {s.problem?.title}
                      </div>
                    </div>
                    <span className="mono" style={{ fontSize: 11, color, fontWeight: 600 }}>
                      {VERDICT_SHORT[s.verdict] || s.verdict}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="label">Submission activity</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {submissions.length} submissions this year
          </div>
        </div>
        {loading ? (
          <div className="skeleton" style={{ height: 90 }} />
        ) : (
          <Heatmap submissions={submissions} />
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;