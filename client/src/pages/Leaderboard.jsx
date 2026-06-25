import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, Medal } from 'lucide-react';
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
  const medalColor = ['#F59E0B', '#9CA3AF', '#CD7F32'];

  return (
    <div style={{ padding: '32px 36px', maxWidth: 800 }}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, background: 'rgba(245,158,11,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trophy size={18} color="#F59E0B" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>Leaderboard</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Ranked by XP · updated in real time</p>
        </div>
        {myRank > 0 && (
          <div style={{
            background: 'var(--accent-blue-dim)', border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 10, padding: '10px 16px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 11, color: '#6366F1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Your rank</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 700, color: '#6366F1', marginTop: 2 }}>#{myRank}</div>
          </div>
        )}
      </motion.div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 10 }} />)}
        </div>
      ) : leaders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🏆</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>No rankings yet</div>
          <div style={{ fontSize: 13 }}>Solve problems to claim your spot</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {leaders.map((l, i) => {
            const isMe = l.userId === user?._id;
            const isTop3 = i < 3;
            return (
              <motion.div key={l.userId}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  background: isMe ? 'rgba(99,102,241,0.08)' : 'var(--bg-surface)',
                  border: `1px solid ${isMe ? 'rgba(99,102,241,0.25)' : 'var(--border)'}`,
                  borderRadius: 10,
                  transition: 'border-color 0.15s',
                }}
                whileHover={{ borderColor: isMe ? 'rgba(99,102,241,0.4)' : 'var(--border-hover)' }}
              >
                <div style={{ width: 28, textAlign: 'center', flexShrink: 0 }}>
                  {isTop3 ? (
                    <Medal size={18} color={medalColor[i]} />
                  ) : (
                    <span style={{ fontSize: 13, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', fontWeight: 600 }}>#{l.rank}</span>
                  )}
                </div>

                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: isTop3
                    ? `linear-gradient(135deg, ${medalColor[i]}40, ${medalColor[i]}20)`
                    : 'var(--bg-elevated)',
                  border: `1px solid ${isTop3 ? `${medalColor[i]}40` : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  color: isTop3 ? medalColor[i] : 'var(--text-secondary)',
                }}>
                  {l.name?.[0]?.toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{l.name}</span>
                    {isMe && <span style={{ fontSize: 10, fontWeight: 700, color: '#6366F1', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 4, padding: '1px 6px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>You</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{l.solvedCount} problems solved</div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Zap size={14} color="#F59E0B" />
                  <span style={{ fontFamily: 'JetBrains Mono', fontSize: 15, fontWeight: 700, color: '#F59E0B' }}>{l.xp}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>XP</span>
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