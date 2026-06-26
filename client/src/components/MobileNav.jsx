import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Code2, Trophy, Clock, User } from 'lucide-react';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/problems', icon: Code2, label: 'Problems' },
  { to: '/submissions', icon: Clock, label: 'Submissions' },
  { to: '/leaderboard', icon: Trophy, label: 'Ranks' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const MobileNav = () => (
  <div style={{
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
    background: 'var(--bg-surface)',
    borderTop: '1px solid var(--border)',
    display: 'flex', alignItems: 'center',
    height: 62,
    paddingBottom: 'env(safe-area-inset-bottom)',
  }}>
    {NAV.map(({ to, icon: Icon, label }) => (
      <NavLink key={to} to={to} style={{ flex: 1, textDecoration: 'none' }}>
        {({ isActive }) => (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '8px 0',
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            transition: 'color 0.12s',
          }}>
            <Icon size={18} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400 }}>{label}</span>
          </div>
        )}
      </NavLink>
    ))}
  </div>
);

export default MobileNav;