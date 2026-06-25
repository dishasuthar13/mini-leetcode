import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import api from '../api/axios';

const AppShell = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      api.get('/submissions/stats').then(r => setStats(r.data)).catch(() => {});
    }
  }, [user]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar stats={stats} />
      <main style={{
        marginLeft: 'var(--sidebar-width)',
        flex: 1,
        minHeight: '100vh',
        overflowY: 'auto',
      }}>
        <Outlet context={{ stats, setStats }} />
      </main>
    </div>
  );
};

export default AppShell;