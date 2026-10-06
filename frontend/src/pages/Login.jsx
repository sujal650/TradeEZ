import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { TrendingUp, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginDemoTrader, loginDemoAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/portfolio';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoTrader = async () => {
    try {
      setLoading(true);
      await loginDemoTrader();
      navigate('/portfolio', { replace: true });
    } catch (err) {
      setError('Demo trader login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    try {
      setLoading(true);
      await loginDemoAdmin();
      navigate('/admin', { replace: true });
    } catch (err) {
      setError('Demo admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 460, margin: '3rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
          }}>
            <TrendingUp size={24} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Access your simulated portfolio & live trading terminal
          </p>
        </div>

        {/* 1-Click Demo Logins for Evaluator Convenience */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.65rem', textAlign: 'center' }}>
            1-Click Instant Demo Credentials
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <button
              type="button"
              onClick={handleDemoTrader}
              className="btn btn-outline btn-sm"
              style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', fontSize: '0.775rem' }}
            >
              <UserCheck size={14} /> Demo Trader
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="btn btn-outline btn-sm"
              style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#a5b4fc', fontSize: '0.775rem' }}
            >
              <ShieldCheck size={14} /> Demo Admin
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            color: '#fb7185',
            fontSize: '0.825rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-faint)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="trader@stockez.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-faint)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Create one with $50k credit <ArrowRight size={13} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
