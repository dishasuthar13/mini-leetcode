import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import api from '../api/axios';

const DIFF_COLORS = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' };

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
  return '#10B981';
};

const VERDICT_COLOR = { 'Accepted': '#10B981', 'Wrong Answer': '#EF4444', 'Runtime Error': '#EF4444', 'Time Limit Exceeded': '#F59E0B' };

const Profile = () => {
  const { user } = useAuth();
  const { stats } = useOutletContext() || {};
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/submissions').then(r => setSubmissions(r.data)).finally(() => setLoading(false));
  }, []);

  const heatmap = buildHeatmap(submissions);
  const chartData = stats ? Object.entries(stats.solvedByDifficulty || {}).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value })) : [];
  const xp = stats?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const acceptanceRate = stats?.totalSubmissions > 0 ? Math.round((stats.accepted / stats.totalSubmissions) * 100) : 0;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 18,
          background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 800, color: 'white', flexShrink: 0,
          boxShadow: '0 0 30px rgba(99,102,241,0.3)'
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>{user?.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 10px', fontFamily: 'JetBrains Mono' }}>{user?.email}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { label: `⚡ ${xp} XP`, bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#F59E0B' },
              { label: `Level ${level}`, bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)', color: '#6366F1' },
              { label: `${stats?.solvedCount || 0} solved`, bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#10B981' },
              { label: `${acceptanceRate}% AC`, bg: 'var(--bg-elevated)', border: 'var(--border)', color: 'var(--text-secondary)' },
            ].map(b => (
              <span key={b.label} style={{
                fontSize: 12, fontWeight: 600, color: b.color,
                background: b.bg, border: `1px solid ${b.border}`,
                borderRadius: 7, padding: '4px 12px',
              }}>{b.label}</span>
            ))}
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Solved', value: stats?.solvedCount || 0, color: '#6366F1' },
          { label: 'Submissions', value: stats?.totalSubmissions || 0, color: 'var(--text-primary)' },
          { label: 'Accepted', value: stats?.accepted || 0, color: '#10B981' },
          { label: 'Accuracy', value: `${acceptanceRate}%`, color: '#F59E0B' },
        ].map(item => (
          <div key={item.label} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: item.color }}>{item.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 16 }}>Submission Activity</div>
          {loading ? <div className="skeleton" style={{ height: 96, borderRadius: 8 }} /> : (
            <>
              <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
                {heatmap.map((week, wi) => (
                  <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {week.map(day => (
                      <div key={day.key} title={`${day.key}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                        style={{ width: 11, height: 11, borderRadius: 2, background: getHeatColor(day.count), border: '1px solid rgba(255,255,255,0.03)' }} />
                    ))}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Less</span>
                {['var(--bg-elevated)', '#1a3a2a', '#166534', '#10B981'].map((c, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: c, border: '1px solid rgba(255,255,255,0.04)' }} />
                ))}
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>More</span>
              </div>
            </>
          )}
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 8 }}>By Difficulty</div>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={36} outerRadius={56} paddingAngle={4} stroke="none">
                    {chartData.map(e => <Cell key={e.name} fill={DIFF_COLORS[e.name]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chartData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: DIFF_COLORS[d.name] }} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: DIFF_COLORS[d.name] }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div style={{ height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Solve problems to see data</div>}
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: 16 }}>Recent Submissions</div>
        {submissions.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No submissions yet</p>
        ) : (
          <div>
            {submissions.slice(0, 8).map((s, i) => {
              const color = VERDICT_COLOR[s.verdict] || '#888';
              return (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{s.problem?.title}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 10, fontFamily: 'JetBrains Mono' }}>{s.language}</span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(s.createdAt).toLocaleDateString()}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, borderRadius: 5, padding: '2px 8px', fontFamily: 'JetBrains Mono' }}>
                    {s.verdict === 'Accepted' ? 'AC' : s.verdict === 'Wrong Answer' ? 'WA' : 'ERR'}
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