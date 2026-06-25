import { useEffect, useRef, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, TrendingUp, Target, Zap, Star } from 'lucide-react';
import api from '../api/axios';

const SolvedRing = ({ solved, total }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = total ? (solved / total) * circ : 0;

  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="8" />
        <motion.circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{solved}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>/ {total}</div>
      </div>
    </div>
  );
};

const DiffBar = ({ label, solved, total, color }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
      <span style={{ fontSize: 12, color: color, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{solved}<span style={{ color: 'var(--text-muted)' }}>/{total}</span></span>
    </div>
    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${total ? (solved / total) * 100 : 0}%` }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: 3 }}
      />
    </div>
  </div>
);

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
  const startDay = start.getDay();
  start.setDate(start.getDate() - startDay);

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
    return '#10B981';
  };

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
      <div style={{ display: 'flex', gap: 3, width: 'max-content' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day) => (
              <div
                key={day.key}
                title={`${day.key}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                style={{
                  width: 12, height: 12, borderRadius: 3,
                  background: getColor(day.count),
                  cursor: 'default',
                  border: '1px solid rgba(255,255,255,0.03)',
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Less</span>
        {['var(--bg-elevated)', '#1a3a2a', '#166534', '#10B981'].map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c, border: '1px solid rgba(255,255,255,0.04)' }} />
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>More</span>
      </div>
    </div>
  );
};

const verdictDot = {
  'Accepted': '#10B981',
  'Wrong Answer': '#EF4444',
  'Runtime Error': '#EF4444',
  'Time Limit Exceeded': '#F59E0B',
};

const Dashboard = () => {
  const { user } = useAuth();
  const { stats } = useOutletContext() || {};
  const [submissions, setSubmissions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  useEffect(() => {
    Promise.all([api.get('/submissions'), api.get('/problems')])
      .then(([s, p]) => { setSubmissions(s.data); setProblems(p.data); })
      .finally(() => setLoading(false));
  }, []);

  const totalProblems = problems.length;
  const solvedCount = stats?.solvedCount || 0;
  const xp = stats?.xp || 0;
  const level = Math.floor(xp / 100) + 1;

  const recentAccepted = submissions.filter(s => s.verdict === 'Accepted').slice(0, 3);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100 }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'JetBrains Mono' }}>
          Good {greet} ·{' '}
          <span style={{ color: 'var(--accent-blue)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
          {user?.name} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, margin: 0 }}>
          Level {level} coder · {xp} XP total
        </p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Problems Solved', value: solvedCount, icon: Target, color: '#6366F1', sub: `of ${totalProblems} total` },
          { label: 'Acceptance Rate', value: stats?.totalSubmissions > 0 ? `${Math.round((stats.accepted / stats.totalSubmissions) * 100)}%` : '—', icon: TrendingUp, color: '#10B981', sub: `${stats?.accepted || 0} accepted` },
          { label: 'XP Earned', value: xp, icon: Zap, color: '#F59E0B', sub: `Level ${level}` },
        ].map((item, i) => (
          <motion.div key={item.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '20px 24px',
              transition: 'border-color 0.15s',
            }}
            whileHover={{ borderColor: 'var(--border-hover)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{item.label}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: 28, fontWeight: 700, color: item.color, lineHeight: 1 }}>{item.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{item.sub}</div>
              </div>
              <div style={{ padding: 10, borderRadius: 10, background: `${item.color}18` }}>
                <item.icon size={18} color={item.color} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Progress by difficulty */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 28, marginBottom: 28 }}>
            <SolvedRing solved={solvedCount} total={totalProblems} />
            <div style={{ flex: 1, paddingTop: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Progress</div>
              <DiffBar label="Easy" solved={stats?.solvedByDifficulty?.Easy || 0} total={8} color="#10B981" />
              <DiffBar label="Medium" solved={stats?.solvedByDifficulty?.Medium || 0} total={4} color="#F59E0B" />
              <DiffBar label="Hard" solved={stats?.solvedByDifficulty?.Hard || 0} total={1} color="#EF4444" />
            </div>
          </div>
          {stats?.recommendedDifficulty && (
            <div style={{
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: 12, color: '#6366F1', fontWeight: 600 }}>🎯 Recommended next</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Try <strong>{stats.recommendedDifficulty}</strong> problems to level up</div>
              </div>
              <Link to="/problems" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}>
                Browse <ArrowRight size={12} />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent accepted */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Recent Submissions</div>
            <Link to="/submissions" style={{ fontSize: 12, color: '#6366F1', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3 }}>
              All <ArrowRight size={11} />
            </Link>
          </div>

          {submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🚀</div>
              <div style={{ fontSize: 13, marginBottom: 4 }}>No submissions yet</div>
              <Link to="/problems" style={{ fontSize: 12, color: '#6366F1', textDecoration: 'none' }}>Solve your first problem →</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {submissions.slice(0, 6).map(s => (
                <Link key={s._id} to={`/problems/${s.problem?.slug}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    background: 'var(--bg-elevated)',
                    textDecoration: 'none',
                    transition: 'background 0.15s',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: verdictDot[s.verdict] || '#888', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.problem?.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                      {s.language} · {new Date(s.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: verdictDot[s.verdict], fontWeight: 600, flexShrink: 0 }}>
                    {s.verdict === 'Accepted' ? 'AC' : s.verdict === 'Wrong Answer' ? 'WA' : s.verdict === 'Time Limit Exceeded' ? 'TLE' : 'RE'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Activity heatmap */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600 }}>Submission Activity</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{submissions.length} total submissions in the past year</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Star size={14} color="#F59E0B" />
            <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>{stats?.streak || 0} day streak</span>
          </div>
        </div>
        {loading ? (
          <div style={{ height: 100, background: 'var(--bg-elevated)', borderRadius: 8 }} className="skeleton" />
        ) : (
          <Heatmap submissions={submissions} />
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;