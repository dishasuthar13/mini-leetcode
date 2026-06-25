import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard').then(r => setLeaders(r.data)).finally(() => setLoading(false));
  }, []);

  const myRank = leaders.findIndex(l => l.userId === user?._id) + 1;

  return (
    <div style={{ padding: '32px 36px', maxWidth: 720 }}>
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, background: 'var(--amber-dim)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={15} color="var(--amber)" />
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>Leaderboard</h1>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Ranked by XP earned from solved problems</p>
          </div>
          {myRank > 0 && (
            <div style={{
              background: 'var(--accent-dim)', border: '1px solid var(--accent-border)',
              borderRadius: 10, padding: '10px 16px', textAlign: 'center',
            }}>
              <div className="label" style={{ color: 'var(--accent)', marginBottom: 4 }}>Your rank</div>
              <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)' }}>#{myRank}</div>
            </div>
          )}
        </div>
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />)}
        </div>
      ) : leaders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <Trophy size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No rankings yet</div>
          <div style={{ fontSize: 13 }}>Solve problems to claim your spot</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 100px 100px', padding: '10px 18px', borderBottom: '1px solid var(--border)', gap: 12 }}>
            {['Rank', 'Developer', 'Solved', 'XP'].map(h => <span key={h} className="label">{h}</span>)}
          </div>
          {leaders.map((l, i) => {
            const isMe = l.userId === user?._id;
            return (
              <motion.div key={l.userId}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                style={{
                  display: 'grid', gridTemplateColumns: '48px 1fr 100px 100px',
                  alignItems: 'center', padding: '14px 18px',
                  borderBottom: '1px solid var(--border)',
                  gap: 12,
                  background: isMe ? 'var(--accent-dim)' : 'transparent',
                  borderLeft: `2px solid ${isMe ? 'var(--accent)' : 'transparent'}`,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent'; }}
              >
                <span className="mono" style={{
                  fontSize: 13, fontWeight: 700,
                  color: i === 0 ? 'var(--amber)' : i === 1 ? 'var(--text-secondary)' : i === 2 ? '#CD7F32' : 'var(--text-muted)',
                }}>
                  {i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `#${l.rank}`}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: isMe ? 'var(--accent)' : 'var(--bg-elevated)',
                    border: `1px solid ${isMe ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: isMe ? 'white' : 'var(--text-secondary)',
                  }}>
                    {l.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{l.name}</div>
                    {isMe && <div className="label" style={{ color: 'var(--accent)' }}>You</div>}
                  </div>
                </div>
                <span className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{l.solvedCount}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Zap size={12} color="var(--amber)" />
                  <span className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber)' }}>{l.xp}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;