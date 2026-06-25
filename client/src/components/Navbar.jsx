import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const link = ({ isActive }) =>
  `text-sm font-medium transition-colors px-1 py-0.5 ${isActive
    ? 'text-blue-600 border-b-2 border-blue-600'
    : 'text-gray-500 hover:text-gray-900'}`;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200 px-6 py-3 flex justify-between items-center"
    >
      <div className="flex items-center gap-8">
        <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-gray-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-4 h-4 text-white" />
          </div>
          <span className="text-base">Mini LeetCode</span>
        </NavLink>
        <div className="flex items-center gap-6">
          <NavLink to="/problems" className={link}>Problems</NavLink>
          <NavLink to="/leaderboard" className={link}>Leaderboard</NavLink>
          <NavLink to="/submissions" className={link}>Submissions</NavLink>
          <NavLink to="/profile" className={link}>Profile</NavLink>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold border border-amber-200">
          <Zap className="w-3 h-3" />
          {user?.xp || 0} XP
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-700">{user?.name}</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 px-2 py-1.5 rounded-md transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </motion.nav>
  );
};

export default Navbar;