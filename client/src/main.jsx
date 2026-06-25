import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1A1A24',
            color: '#E8E8F0',
            border: '1px solid #1E1E2E',
            borderRadius: '10px',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#1A1A24' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#1A1A24' } },
        }}
      />
    </AuthProvider>
  </BrowserRouter>
);