import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Code2, Trophy, Clock,
  User, LogOut, Zap, Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/problems', icon: Code2, label: 'Problems' },
  { to: '/submissions', icon: Clock, label: 'Submissions' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const Sidebar = ({ stats }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const xp = stats?.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const xpProgress = (xp % 100);

  return (
    <motion.aside
      initial={{ x: -10, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'fixed',
        left: 0, top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
      }}
    >
      {/* Brand */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: 'var(--accent)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Code2 size={15} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              CodeForge
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>beta</div>
          </div>
        </NavLink>
      </div>

      {/* User */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: 'linear-gradient(135deg, var(--accent), #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Level {level}</div>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Zap size={10} color="var(--amber)" /> {xp} XP
            </span>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>Lvl {level + 1} → {level * 100}</span>
          </div>
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }}
            />
          </div>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-elevated)', borderRadius: 7,
          padding: '5px 10px', border: '1px solid var(--border)',
        }}>
          <Flame size={12} color="var(--amber)" />
          <span style={{ fontSize: 12, color: 'var(--amber)', fontWeight: 600 }}>
            {stats?.streak || 0} day streak
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        <div className="label" style={{ padding: '6px 10px 8px' }}>Navigation</div>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 8, marginBottom: 1,
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.12s',
                  border: `1px solid ${isActive ? 'var(--accent-border)' : 'transparent'}`,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
              >
                <Icon size={15} />
                {label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom stats */}
      {stats && (
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div className="label" style={{ marginBottom: 8 }}>Solved</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[
              { label: 'Easy', val: stats.solvedByDifficulty?.Easy || 0, color: 'var(--green)' },
              { label: 'Med', val: stats.solvedByDifficulty?.Medium || 0, color: 'var(--amber)' },
              { label: 'Hard', val: stats.solvedByDifficulty?.Hard || 0, color: 'var(--red)' },
            ].map(d => (
              <div key={d.label} style={{
                background: 'var(--bg-elevated)', borderRadius: 7,
                padding: '7px 6px', textAlign: 'center',
                border: '1px solid var(--border)',
              }}>
                <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: d.color }}>{d.val}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => { logout(); navigate('/login'); }}
        style={{
          margin: '6px 12px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 10px', borderRadius: 8,
          background: 'transparent', border: 'none',
          color: 'var(--text-muted)', fontSize: 13,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <LogOut size={14} />
        Sign out
      </button>
    </motion.aside>
  );
};

export default Sidebar;