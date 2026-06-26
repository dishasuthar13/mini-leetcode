import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import api from '../api/axios';

const AppShell = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (user) {
      api.get('/submissions/stats').then(r => setStats(r.data)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {!isMobile && <Sidebar stats={stats} />}
      <main style={{
        marginLeft: isMobile ? 0 : 'var(--sidebar-width)',
        flex: 1,
        minHeight: '100vh',
        overflowY: 'auto',
        paddingBottom: isMobile ? 70 : 0,
      }}>
        <Outlet context={{ stats, setStats }} />
      </main>
      {isMobile && <MobileNav />}
    </div>
  );
};

export default AppShell;