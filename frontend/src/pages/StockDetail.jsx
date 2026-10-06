import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { stockAPI, tradeAPI, portfolioAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StockChart from '../components/StockChart';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  DollarSign,
  Briefcase,
  Layers,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const StockDetail = () => {
  const { symbol } = useParams();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline Trade Ticket state
  const [tradeType, setTradeType] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [tradeSuccess, setTradeSuccess] = useState('');
  const [userHoldings, setUserHoldings] = useState(0);

  const fetchStockData = async (isInitial = false) => {
    try {
      const res = await stockAPI.getBySymbol(symbol);
      setStock(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Stock not found');
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  const fetchHolding = async () => {
    if (isAuthenticated && symbol) {
      try {
        const res = await portfolioAPI.getPortfolio();
        const found = res.data.data.holdings.find(
          h => h.symbol.toUpperCase() === symbol.toUpperCase()
        );
        setUserHoldings(found ? found.quantity : 0);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchStockData(true);
    fetchHolding();
    const interval = setInterval(() => {
      fetchStockData(false);
    }, 3500);

    return () => clearInterval(interval);
  }, [symbol, isAuthenticated]);

  const handleInlineTrade = async (e) => {
    e.preventDefault();
    setTradeError('');
    setTradeSuccess('');

    if (!isAuthenticated) {
      setTradeError('Please log in to trade.');
      return;
    }

    const currentPrice = Number(stock.price);
    const totalCost = currentPrice * quantity;
    const cash = user?.virtualBalance || 0;

    if (tradeType === 'BUY' && totalCost > cash) {
      setTradeError(`Insufficient funds: Need $${totalCost.toLocaleString()} but balance is $${cash.toLocaleString()}.`);
      return;
    }

    if (tradeType === 'SELL' && quantity > userHoldings) {
      setTradeError(`Cannot sell ${quantity} shares. You currently own ${userHoldings} shares.`);
      return;
    }

    try {
      setTradeLoading(true);
      const res = await tradeAPI.executeTrade({
        symbol: stock.symbol,
        type: tradeType,
        quantity: parseInt(quantity, 10)
      });
      setTradeSuccess(res.data.message);
      await refreshUser();
      await fetchHolding();
      setTimeout(() => setTradeSuccess(''), 4000);
    } catch (err) {
      setTradeError(err.response?.data?.message || 'Trade execution failed.');
    } finally {
      setTradeLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        Loading real-time stock details...
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', maxWidth: 600, margin: '2rem auto' }}>
        <AlertCircle size={48} color="#f43f5e" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '0.5rem' }}>{error || 'Stock Not Found'}</h2>
        <Link to="/market" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Market
        </Link>
      </div>
    );
  }

  const isBull = (stock.changePercent || 0) >= 0;
  const currentPrice = Number(stock.price);
  const totalTradeAmount = parseFloat((currentPrice * quantity).toFixed(2));
  const cash = user?.virtualBalance || 0;

  return (
    <div>
      {/* Back Link */}
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/market" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} /> Back to Market Equities
        </Link>
      </div>

      {/* Main Stock Header */}
      <div className="glass-panel" style={{ padding: '1.75rem 2rem', marginBottom: '2rem' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '2.2rem', margin: 0, fontFamily: 'Plus Jakarta Sans' }}>
                {stock.symbol}
              </h1>
              <span className="badge-neutral" style={{ fontSize: '0.8rem' }}>
                {stock.sector}
              </span>
              {stock.status === 'halted' && (
                <span className="badge-bear" style={{ fontSize: '0.75rem' }}>
                  TRADING HALTED
                </span>
              )}
            </div>
            <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
              {stock.name}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace',
              color: 'var(--text-main)',
              lineHeight: 1
            }}>
              ${stock.price?.toFixed(2)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.4rem' }}>
              <span className={isBull ? 'badge-bull' : 'badge-bear'} style={{ fontSize: '0.875rem' }}>
                {isBull ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isBull ? '+' : ''}${stock.change?.toFixed(2)} ({isBull ? '+' : ''}{stock.changePercent?.toFixed(2)}%)
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-faint)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={12} /> Live Tick
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Grid: Chart + Trade Ticket */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Left Column: Interactive Chart */}
        <div className="glass-panel" style={{ padding: '1.75rem', gridColumn: 'span 2' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="var(--accent-primary)" /> Price Action Performance
            </h3>
          </div>
          <StockChart stock={stock} />
        </div>

        {/* Right Column: Live Trade Execution Ticket */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} color="#10b981" /> Trade Ticket
          </h3>

          {!isAuthenticated ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <Briefcase size={36} color="#6366f1" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Sign in to simulate trades for {stock.symbol} using your virtual balance.
              </p>
              <Link to="/login" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                Log In to Trade
              </Link>
            </div>
          ) : (
            <form onSubmit={handleInlineTrade}>
              {/* Type Switcher */}
              <div className="tabs-header" style={{ marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className={`tab-btn ${tradeType === 'BUY' ? 'active tab-bull' : ''}`}
                  onClick={() => { setTradeType('BUY'); setTradeError(''); }}
                >
                  Buy {stock.symbol}
                </button>
                <button
                  type="button"
                  className={`tab-btn ${tradeType === 'SELL' ? 'active tab-bear' : ''}`}
                  onClick={() => { setTradeType('SELL'); setTradeError(''); }}
                >
                  Sell {stock.symbol}
                </button>
              </div>

              {/* Holdings info */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.825rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Owned Shares:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{userHoldings} Shares</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Available Cash:</span>
                  <span style={{ fontWeight: 700, color: '#10b981' }}>${cash.toLocaleString()}</span>
                </div>
              </div>

              {/* Quantity */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                  Shares to {tradeType}
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="input-control"
                  style={{ fontFamily: 'JetBrains Mono', fontSize: '1rem', fontWeight: 700 }}
                />
              </div>

              {/* Estimated Total */}
              <div style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}>
                <div className="flex-between">
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Value</span>
                  <span style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    fontFamily: 'JetBrains Mono',
                    color: tradeType === 'BUY' ? 'var(--bull-green)' : 'var(--bear-red)'
                  }}>
                    ${totalTradeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {tradeError && (
                <div style={{
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fb7185',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <AlertCircle size={15} /> {tradeError}
                </div>
              )}

              {tradeSuccess && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  color: '#34d399',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}>
                  <CheckCircle size={15} /> {tradeSuccess}
                </div>
              )}

              <button
                type="submit"
                disabled={tradeLoading}
                className={`btn ${tradeType === 'BUY' ? 'btn-bull' : 'btn-bear'}`}
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {tradeLoading ? 'Executing Trade...' : `Execute ${tradeType}`}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Fundamental Metrics & Company Description */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem'
      }}>
        {/* Key Statistics */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>
            Key Market Statistics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Day Low / High</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                ${stock.low?.toFixed(2)} - ${stock.high?.toFixed(2)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>52-Week Range</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                ${stock.dailyStats?.week52Low?.toFixed(2) || 'N/A'} - ${stock.dailyStats?.week52High?.toFixed(2) || 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Trading Volume</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {stock.volume ? (stock.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Market Capitalization</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {stock.marketCap ? '$' + (stock.marketCap / 1000000000).toFixed(1) + 'B' : 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>P/E Ratio</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {stock.dailyStats?.peRatio ? stock.dailyStats.peRatio : 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase' }}>Dividend Yield</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.95rem', fontWeight: 600, marginTop: '0.2rem' }}>
                {stock.dailyStats?.dividendYield ? `${stock.dailyStats.dividendYield}%` : '0.00%'}
              </div>
            </div>
          </div>
        </div>

        {/* Company Profile */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>
            Company & Asset Profile
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {stock.description || 'No detailed description available for this ticker.'}
          </p>
          <div style={{
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-faint)'
          }}>
            Trading simulator status: <strong>{stock.status?.toUpperCase()}</strong>. Ticker prices polled and updated dynamically every 3.5 seconds.
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
