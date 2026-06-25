import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Terminal, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
    borderRadius: 9, color: 'var(--text-primary)', fontSize: 14,
    fontFamily: 'Inter', outline: 'none', transition: 'border-color 0.15s',
    marginBottom: 12,
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '48px 64px', background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code2 size={18} color="white" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Mini LeetCode</span>
        </div>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: '#6366F1', marginBottom: 16 }}>// join thousands of developers</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 24 }}>
            Start your<br />
            <span style={{ background: 'linear-gradient(90deg, #6366F1, #10B981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              coding journey.
            </span>
          </h2>
          {[
            { icon: Terminal, text: 'Practice with real coding problems' },
            { icon: Trophy, text: 'Earn XP and climb rankings' },
            { icon: Zap, text: 'AI-powered hints when you get stuck' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <f.icon size={15} color="#6366F1" />
              </div>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{f.text}</span>
            </motion.div>
          ))}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-muted)' }}>Built with React · Node.js · MongoDB</div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.4px' }}>Create your account</h1>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28 }}>Start solving in under a minute</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#EF4444' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Name', type: 'text', val: name, set: setName, ph: 'Your name' },
              { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@example.com' },
              { label: 'Password', type: 'password', val: password, set: setPassword, ph: '••••••••' },
            ].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, fontWeight: 500 }}>{f.label}</label>
                <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={inputStyle} required
                  onFocus={e => e.target.style.borderColor = '#6366F1'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }} />
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? 'var(--bg-elevated)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: loading ? 'var(--text-muted)' : 'white',
                border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Inter',
              }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;