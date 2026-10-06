import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tradeAPI, portfolioAPI } from '../services/api';
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const TradeModal = ({ stock, initialType = 'BUY', isOpen, onClose, onTradeSuccess }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [tradeType, setTradeType] = useState(initialType);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userHoldings, setUserHoldings] = useState(0);

  useEffect(() => {
    if (initialType) setTradeType(initialType);
  }, [initialType]);

  // Fetch how many shares user currently owns
  useEffect(() => {
    const fetchHoldings = async () => {
      if (isAuthenticated && stock) {
        try {
          const res = await portfolioAPI.getPortfolio();
          const holding = res.data.data.holdings.find(
            h => h.symbol.toUpperCase() === stock.symbol.toUpperCase()
          );
          setUserHoldings(holding ? holding.quantity : 0);
        } catch (err) {
          console.error(err);
        }
      }
    };
    if (isOpen) {
      setError('');
      setSuccess('');
      fetchHoldings();
    }
  }, [isOpen, isAuthenticated, stock]);

  if (!isOpen || !stock) return null;

  const currentPrice = Number(stock.price);
  const totalAmount = parseFloat((currentPrice * quantity).toFixed(2));
  const cashBalance = user?.virtualBalance || 0;
  const maxBuyQuantity = Math.floor(cashBalance / currentPrice) || 0;

  const handleExecute = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (quantity <= 0) {
      setError('Please specify a positive quantity of shares.');
      return;
    }

    if (tradeType === 'BUY' && totalAmount > cashBalance) {
      setError(`Insufficient virtual funds! You need $${totalAmount.toLocaleString()} but have $${cashBalance.toLocaleString()}.`);
      return;
    }

    if (tradeType === 'SELL' && quantity > userHoldings) {
      setError(`Cannot sell ${quantity} shares. You only own ${userHoldings} shares.`);
      return;
    }

    try {
      setLoading(true);
      const res = await tradeAPI.executeTrade({
        symbol: stock.symbol,
        type: tradeType,
        quantity: parseInt(quantity, 10)
      });

      setSuccess(res.data.message);
      await refreshUser();
      if (onTradeSuccess) onTradeSuccess(res.data);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Trade execution failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>
              Trade {stock.symbol}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {stock.name}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>

        {!isAuthenticated ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <AlertCircle size={40} color="#6366f1" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-main)', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
              You must be logged in to execute simulated trades with virtual capital.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Log In to Start Trading
            </Link>
          </div>
        ) : (
          <form onSubmit={handleExecute}>
            {/* BUY / SELL Switch */}
            <div className="tabs-header" style={{ marginBottom: '1.25rem' }}>
              <button
                type="button"
                className={`tab-btn ${tradeType === 'BUY' ? 'active tab-bull' : ''}`}
                onClick={() => { setTradeType('BUY'); setError(''); }}
              >
                Buy {stock.symbol}
              </button>
              <button
                type="button"
                className={`tab-btn ${tradeType === 'SELL' ? 'active tab-bear' : ''}`}
                onClick={() => { setTradeType('SELL'); setError(''); }}
              >
                Sell {stock.symbol}
              </button>
            </div>

            {/* Current Price & Info */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem',
              border: '1px solid var(--border-subtle)'
            }}>
              <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Market Price</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-main)' }}>
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex-between">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your Holdings</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {userHoldings} Shares
                </span>
              </div>
            </div>

            {/* Quantity Input */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Number of Shares
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="input-control"
                  style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>

              {/* Quick Steppers */}
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem' }}>
                {[1, 5, 10, 25].map(qty => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1, padding: '0.25rem', fontSize: '0.75rem' }}
                  >
                    +{qty}
                  </button>
                ))}
                {tradeType === 'BUY' && maxBuyQuantity > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuantity(maxBuyQuantity)}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1.3, padding: '0.25rem', fontSize: '0.75rem', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  >
                    Max ({maxBuyQuantity})
                  </button>
                )}
                {tradeType === 'SELL' && userHoldings > 0 && (
                  <button
                    type="button"
                    onClick={() => setQuantity(userHoldings)}
                    className="btn btn-outline btn-sm"
                    style={{ flex: 1.3, padding: '0.25rem', fontSize: '0.75rem', borderColor: 'rgba(244, 63, 94, 0.4)' }}
                  >
                    All ({userHoldings})
                  </button>
                )}
              </div>
            </div>

            {/* Total Calculation Card */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              marginBottom: '1.25rem'
            }}>
              <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated Total</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: tradeType === 'BUY' ? 'var(--bull-green)' : 'var(--bear-red)' }}>
                  ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-faint)' }}>
                <span>Available Cash Balance</span>
                <span>${cashBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Error or Success Notice */}
            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                color: '#fb7185',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                color: '#34d399',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem'
              }}>
                <CheckCircle size={16} />
                <span>{success}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !!success}
              className={`btn ${tradeType === 'BUY' ? 'btn-bull' : 'btn-bear'}`}
              style={{ width: '100%', padding: '0.8rem' }}
            >
              {loading
                ? 'Processing Trade...'
                : `${tradeType} ${quantity} ${stock.symbol} Shares`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TradeModal;
