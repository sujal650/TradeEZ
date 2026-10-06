import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, User, Lock, Mail, AlertCircle, ArrowRight, Gift } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password);
      navigate('/portfolio');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2.5rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem 2rem' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
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
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>Create Trader Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Start trading global stocks with zero financial risk
          </p>
        </div>

        {/* Promo Gift Callout */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <Gift size={24} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
              $50,000 Virtual Capital Included
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Practice trade execution on live stocks immediately upon signup.
            </div>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-faint)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-control"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="var(--text-faint)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="alex@example.com"
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
              Password (min 6 characters)
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

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-faint)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? 'Creating Account...' : 'Complete Registration & Claim $50k'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
            Sign In Here <ArrowRight size={13} style={{ verticalAlign: 'middle' }} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
