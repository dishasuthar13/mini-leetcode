import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Left panel */}
      <div style={{
        width: 480, flexShrink: 0,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code2 size={16} color="white" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>CodeForge</span>
        </div>

        <div>
          <div className="mono label" style={{ color: 'var(--accent)', marginBottom: 14 }}>
            // competitive programming platform
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 32 }}>
            Practice smarter.<br />
            <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Ship faster.
            </span>
          </h2>

          {[
            { title: 'Real code execution', desc: 'Write and run code directly in your browser with Monaco editor' },
            { title: 'AI-powered feedback', desc: 'Get instant code explanations, reviews, and hints from Llama 3' },
            { title: 'Competitive leaderboard', desc: 'Earn XP, track your streak, and rank against other developers' },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              style={{ display: 'flex', gap: 14, marginBottom: 20 }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', marginTop: 7, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          React · Node.js · MongoDB · Groq AI
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          style={{ width: '100%', maxWidth: 360 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.4px' }}>
            Sign in to CodeForge
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
            Continue your practice session
          </p>

          {error && (
            <div style={{
              background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: 'var(--red)',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {[
              { label: 'Email address', type: 'email', val: email, set: setEmail, ph: 'you@example.com' },
              { label: 'Password', type: 'password', val: password, set: setPassword, ph: '••••••••' },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  type={f.type} value={f.val}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.ph} required
                  style={{
                    width: '100%', padding: '10px 13px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: 8, color: 'var(--text-primary)',
                    fontSize: 13, outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--border-focus)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }} />
            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', padding: '11px', fontSize: 14 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;