import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axios';

const DIFF_COLORS = { Easy: 'var(--green)', Medium: 'var(--amber)', Hard: 'var(--red)' };
const VERDICT_COLOR = {
  'Accepted': 'var(--green)', 'Wrong Answer': 'var(--red)',
  'Runtime Error': 'var(--red)', 'Time Limit Exceeded': 'var(--amber)',
};
const VERDICT_SHORT = {
  'Accepted': 'AC', 'Wrong Answer': 'WA',
  'Runtime Error': 'RE', 'Time Limit Exceeded': 'TLE',
};

const buildHeatmap = (submissions) => {
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
  return weeks;
};

const getHeatColor = (n) => {
  if (n === 0) return 'var(--bg-elevated)';
  if (n === 1) return '#1a3a2a';
  if (n <= 3) return '#166534';
  return 'var(--green)';
};

const Profile = () => {
  const { user } = useAuth();
  const { stats } = useOutletContext() || {};
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    api.get('/submissions').then(r => setSubmissions(r.data)).finally(() => setLoading(false));
  }, []);

  const heatmap = buildHeatmap(submissions);
  const chartData = stats
    ? Object.entries(stats.solvedByDifficulty || {})
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];
  const xp = stats?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const acceptanceRate = stats?.totalSubmissions > 0
    ? Math.round((stats.accepted / stats.totalSubmissions) * 100) : 0;

  return (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 36px', maxWidth: 900 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 14 : 20, marginBottom: 28 }}>
        <div style={{
          width: isMobile ? 56 : 68, height: isMobile ? 56 : 68,
          borderRadius: isMobile ? 14 : 18, flexShrink: 0,
          background: 'linear-gradient(135deg, var(--accent), #7C3AED)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'white',
          boxShadow: '0 0 24px rgba(79,70,229,0.25)',
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: 4 }}>
            {user?.name}
          </h1>
          <p className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: `${xp} XP`, bg: 'var(--amber-dim)', border: 'rgba(245,158,11,0.25)', color: 'var(--amber)' },
              { label: `Level ${level}`, bg: 'var(--accent-dim)', border: 'var(--accent-border)', color: 'var(--accent)' },
              { label: `${stats?.solvedCount || 0} solved`, bg: 'var(--green-dim)', border: 'rgba(16,185,129,0.25)', color: 'var(--green)' },
              { label: `${acceptanceRate}% AC`, bg: 'var(--bg-elevated)', border: 'var(--border)', color: 'var(--text-secondary)' },
            ].map(b => (
              <span key={b.label} style={{
                fontSize: 11, fontWeight: 600, color: b.color,
                background: b.bg, border: `1px solid ${b.border}`,
                borderRadius: 6, padding: '3px 10px',
              }}>{b.label}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 10, marginBottom: 14,
      }}>
        {[
          { label: 'Solved', value: stats?.solvedCount || 0, color: 'var(--accent)' },
          { label: 'Submissions', value: stats?.totalSubmissions || 0, color: 'var(--text-primary)' },
          { label: 'Accepted', value: stats?.accepted || 0, color: 'var(--green)' },
          { label: 'Accuracy', value: `${acceptanceRate}%`, color: 'var(--amber)' },
        ].map(item => (
          <div key={item.label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div className="mono" style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Heatmap + Chart */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 260px',
        gap: 12, marginBottom: 12,
      }}>
        <div className="card" style={{ padding: isMobile ? 18 : 22 }}>
          <div className="label" style={{ marginBottom: 14 }}>Submission Activity</div>
          {loading ? (
            <div className="skeleton" style={{ height: 90 }} />
          ) : (
            <>
              <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
                <div style={{ display: 'flex', gap: 3, width: 'max-content' }}>
                  {heatmap.map((week, wi) => (
                    <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {week.map(day => (
                        <div key={day.key}
                          title={`${day.key}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                          style={{
                            width: 11, height: 11, borderRadius: 2,
                            background: getHeatColor(day.count),
                            border: '1px solid rgba(255,255,255,0.03)',
                          }} />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Less</span>
                {['var(--bg-elevated)', '#1a3a2a', '#166534', 'var(--green)'].map((c, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: c, border: '1px solid rgba(255,255,255,0.04)' }} />
                ))}
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>More</span>
              </div>
            </>
          )}
        </div>

        <div className="card" style={{ padding: isMobile ? 18 : 22 }}>
          <div className="label" style={{ marginBottom: 10 }}>By Difficulty</div>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={32} outerRadius={50} paddingAngle={4} stroke="none">
                    {chartData.map(e => (
                      <Cell key={e.name} fill={
                        e.name === 'Easy' ? '#10B981' : e.name === 'Medium' ? '#F59E0B' : '#EF4444'
                      } />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                      borderRadius: 8, fontSize: 12, color: 'var(--text-primary)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {chartData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: d.name === 'Easy' ? '#10B981' : d.name === 'Medium' ? '#F59E0B' : '#EF4444',
                      }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span className="mono" style={{
                      fontSize: 13, fontWeight: 700,
                      color: d.name === 'Easy' ? 'var(--green)' : d.name === 'Medium' ? 'var(--amber)' : 'var(--red)',
                    }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Solve problems to see data
            </div>
          )}
        </div>
      </div>

      {/* Recent submissions */}
      <div className="card" style={{ padding: isMobile ? 18 : 22 }}>
        <div className="label" style={{ marginBottom: 14 }}>Recent Submissions</div>
        {submissions.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No submissions yet</p>
        ) : (
          <div>
            {submissions.slice(0, 10).map((s, i) => {
              const color = VERDICT_COLOR[s.verdict] || 'var(--text-muted)';
              return (
                <div key={s._id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0',
                  borderBottom: i < 9 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{s.problem?.title}</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 10 }}>{s.language}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                  <span className="mono" style={{
                    fontSize: 11, fontWeight: 700, color,
                    background: `${color}18`, borderRadius: 5, padding: '2px 8px', flexShrink: 0,
                  }}>
                    {VERDICT_SHORT[s.verdict] || '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;