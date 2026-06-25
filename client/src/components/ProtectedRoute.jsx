import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppShell from './AppShell';

const ProtectedRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <AppShell />;
};

export default ProtectedRoute;