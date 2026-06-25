import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
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
            // join the community
          </div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px', lineHeight: 1.15, marginBottom: 32 }}>
            Start your<br />
            <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              coding journey.
            </span>
          </h2>
          {[
            { title: '50+ curated problems', desc: 'Covering arrays, DP, graphs, trees, binary search and more' },
            { title: 'Instant grading', desc: 'Submissions graded against hidden test cases in real time' },
            { title: 'Progress tracking', desc: 'XP, streaks, heatmaps and difficulty breakdown on your profile' },
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

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
          style={{ width: '100%', maxWidth: 360 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, letterSpacing: '-0.4px' }}>
            Create your account
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
            Free forever. No credit card required.
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
              { label: 'Full name', type: 'text', val: name, set: setName, ph: 'Your name' },
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
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;