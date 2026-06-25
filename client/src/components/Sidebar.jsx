import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Code2, Trophy, Clock, User, LogOut,
  Zap, Flame, ChevronRight
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
  const nextLevel = Math.ceil((xp + 1) / 100) * 100;
  const xpProgress = ((xp % 100) / 100) * 100;
  const level = Math.floor(xp / 100) + 1;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <NavLink to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Code2 size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>Mini LeetCode</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>v2.0 · beta</div>
          </div>
        </NavLink>
      </div>

      {/* User card */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0
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

        {/* XP bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Zap size={10} color="#F59E0B" /> {xp} XP
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>→ {nextLevel}</span>
          </div>
          <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)', borderRadius: 2 }}
            />
          </div>
        </div>

        {/* Streak */}
        <div style={{
          marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-elevated)', borderRadius: 8, padding: '6px 10px'
        }}>
          <Flame size={14} color="#F59E0B" />
          <span style={{ fontSize: 12, color: '#F59E0B', fontWeight: 600 }}>
            {stats?.streak || 0} day streak
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 10px', borderRadius: 8, marginBottom: 2,
                  background: isActive ? 'var(--accent-blue-dim)' : 'transparent',
                  color: isActive ? '#6366F1' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'background 0.15s, color 0.15s',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                <Icon size={16} />
                {label}
                {isActive && <ChevronRight size={12} style={{ marginLeft: 'auto' }} />}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Stats quick peek */}
      {stats && (
        <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[
              { label: 'Easy', val: stats.solvedByDifficulty?.Easy || 0, color: '#10B981' },
              { label: 'Med', val: stats.solvedByDifficulty?.Medium || 0, color: '#F59E0B' },
              { label: 'Hard', val: stats.solvedByDifficulty?.Hard || 0, color: '#EF4444' },
            ].map(d => (
              <div key={d.label} style={{
                background: 'var(--bg-elevated)', borderRadius: 8, padding: '8px 6px', textAlign: 'center'
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: d.color, fontFamily: 'JetBrains Mono' }}>{d.val}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{d.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate('/login'); }}
        style={{
          margin: '8px 12px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 8,
          background: 'transparent', border: 'none',
          color: 'var(--text-muted)', cursor: 'pointer',
          fontSize: 13, fontFamily: 'Inter, sans-serif',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <LogOut size={16} />
        Sign out
      </button>
    </motion.aside>
  );
};

export default Sidebar;