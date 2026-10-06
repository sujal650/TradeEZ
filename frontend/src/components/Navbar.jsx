import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  PieChart,
  History,
  ShieldCheck,
  Wallet,
  LogOut,
  RefreshCw,
  User,
  Menu,
  X,
  Compass
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, resetBalance, loginDemoTrader, loginDemoAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const navigate = useNavigate();

  const handleResetBalance = async () => {
    try {
      setResetting(true);
      await resetBalance();
      alert('Virtual balance restored to $50,000.00!');
    } catch (err) {
      alert('Failed to reset balance');
    } finally {
      setResetting(false);
    }
  };

  const handleDemoTrader = async () => {
    try {
      await loginDemoTrader();
      navigate('/portfolio');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDemoAdmin = async () => {
    try {
      await loginDemoAdmin();
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header style={{
      background: 'rgba(10, 14, 23, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #6366f1 100%)',
            padding: '0.45rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <TrendingUp size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'Plus Jakarta Sans',
              background: 'linear-gradient(to right, #ffffff, #94a3b8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em'
            }}>
              Trade<span style={{ color: '#10b981', WebkitTextFillColor: '#10b981' }}>EZ</span>
            </span>
            <span style={{
              display: 'block',
              fontSize: '0.65rem',
              color: 'var(--text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 600,
              marginTop: -2
            }}>
              MERN Stock Exchange
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="d-none d-md-flex">
          <NavLink
            to="/market"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? '#6366f1' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)'
            })}
          >
            <Compass size={17} /> Market Explorer
          </NavLink>

          <NavLink
            to="/portfolio"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? '#6366f1' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)'
            })}
          >
            <PieChart size={17} /> Portfolio
          </NavLink>

          <NavLink
            to="/transactions"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isActive ? '#6366f1' : 'var(--text-muted)',
              transition: 'color var(--transition-fast)'
            })}
          >
            <History size={17} /> Trades Log
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: isActive ? '#10b981' : '#a7f3d0',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              })}
            >
              <ShieldCheck size={17} /> Admin Panel
            </NavLink>
          )}
        </nav>

        {/* Right Section / Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* Virtual Balance Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'rgba(15, 23, 42, 0.9)',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  boxShadow: '0 0 12px rgba(99, 102, 241, 0.15)'
                }}
                title="Your virtual trading cash"
              >
                <Wallet size={15} color="#10b981" />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cash:</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#10b981'
                }}>
                  ${user?.virtualBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </span>
                <button
                  onClick={handleResetBalance}
                  disabled={resetting}
                  title="Reset balance to $50,000"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2
                  }}
                >
                  <RefreshCw size={13} className={resetting ? 'spin' : ''} />
                </button>
              </div>

              {/* User badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: user?.role === 'ADMIN' ? 'linear-gradient(135deg, #10b981, #06b6d4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="d-none d-lg-block">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.1 }}>
                    {user?.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: user?.role === 'ADMIN' ? '#10b981' : 'var(--text-muted)' }}>
                    {user?.role}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="btn btn-outline btn-sm"
                title="Logout"
                style={{ padding: '0.45rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              {/* Quick 1-click Demo buttons */}
              <button
                onClick={handleDemoTrader}
                className="btn btn-outline btn-sm d-none d-sm-inline-flex"
                style={{ borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399' }}
              >
                Demo Trader
              </button>
              <button
                onClick={handleDemoAdmin}
                className="btn btn-outline btn-sm d-none d-sm-inline-flex"
                style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#a5b4fc' }}
              >
                Demo Admin
              </button>

              <Link to="/login" className="btn btn-outline btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-outline btn-sm d-md-none"
            style={{ padding: '0.4rem' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.98)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }} className="d-md-none">
          <Link
            to="/market"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Compass size={18} /> Market Explorer
          </Link>
          <Link
            to="/portfolio"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <PieChart size={18} /> Portfolio
          </Link>
          <Link
            to="/transactions"
            onClick={() => setMobileMenuOpen(false)}
            style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <History size={18} /> Trade History
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ShieldCheck size={18} /> Admin Panel
            </Link>
          )}
          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => { handleDemoTrader(); setMobileMenuOpen(false); }} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                Demo Trader
              </button>
              <button onClick={() => { handleDemoAdmin(); setMobileMenuOpen(false); }} className="btn btn-outline btn-sm" style={{ flex: 1 }}>
                Demo Admin
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
