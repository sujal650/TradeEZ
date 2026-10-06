import React, { useState, useEffect } from 'react';
import { tradeAPI } from '../services/api';
import { Link } from 'react-router-dom';
import {
  History,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchSymbol, setSearchSymbol] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await tradeAPI.getHistory(100);
      setTransactions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = transactions.filter(t => {
    if (filterType !== 'ALL' && t.type !== filterType) return false;
    if (searchSymbol.trim() && !t.symbol.toLowerCase().includes(searchSymbol.toLowerCase().trim())) {
      return false;
    }
    return true;
  });

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
          Trade Execution History
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Audited log of your simulated buy and sell market transactions.
        </p>
      </div>

      {/* Filter bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Symbol search */}
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
            <Search size={16} color="var(--text-faint)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter by symbol (e.g. AAPL)..."
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Trade Type Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'BUY', 'SELL'].map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                style={{
                  background: filterType === t ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                  color: filterType === t ? '#ffffff' : 'var(--text-muted)',
                  border: filterType === t ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  padding: '0.4rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t === 'ALL' ? 'All Trades' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            Retrieving transaction history...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <History size={40} color="var(--text-faint)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Trades Found</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              No transactions match your current search criteria.
            </p>
            <Link to="/market" className="btn btn-primary btn-sm">
              Explore Market
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Ticker</th>
                  <th>Order Type</th>
                  <th>Quantity</th>
                  <th>Execution Price</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const isBuy = tx.type === 'BUY';
                  const date = new Date(tx.timestamp || tx.createdAt);
                  return (
                    <tr key={tx._id}>
                      <td>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontFamily: 'JetBrains Mono' }}>
                          {date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', fontFamily: 'JetBrains Mono' }}>
                          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <Link to={`/stock/${tx.symbol}`} style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                          {tx.symbol}
                        </Link>
                      </td>
                      <td>
                        <span className={isBuy ? 'badge-bull' : 'badge-bear'}>
                          {isBuy ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {tx.type}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>
                          {tx.quantity} Shares
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono' }}>
                          ${tx.price?.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'JetBrains Mono',
                          fontWeight: 700,
                          color: isBuy ? 'var(--bull-green)' : 'var(--bear-red)'
                        }}>
                          ${tx.totalAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: '#34d399',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          <CheckCircle2 size={12} />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
