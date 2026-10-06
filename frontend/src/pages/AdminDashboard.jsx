import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import {
  ShieldCheck,
  Users,
  Layers,
  Activity,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pause,
  Play,
  Search,
  DollarSign
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('stocks'); // 'stocks', 'users', 'transactions'
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // New stock form state
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newStock, setNewStock] = useState({
    symbol: '',
    name: '',
    price: '',
    sector: 'Technology',
    description: '',
    isFeatured: false
  });
  const [stockFormError, setStockFormError] = useState('');
  const [stockFormSuccess, setStockFormSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, txRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getTransactions()
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setTransactions(txRes.data.data || []);

      // Also get stocks via import or direct API
      const stocksRes = await adminAPI.getStats(); // Has stats, let's fetch stocks from stock endpoint
      const allStocksRes = await fetch('/api/stocks').then(r => r.json());
      setStocks(allStocksRes.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stock Actions
  const handleCreateStock = async (e) => {
    e.preventDefault();
    setStockFormError('');
    setStockFormSuccess('');

    if (!newStock.symbol || !newStock.name || !newStock.price) {
      setStockFormError('Symbol, Name, and Price are required.');
      return;
    }

    try {
      await adminAPI.createStock(newStock);
      setStockFormSuccess(`Stock ${newStock.symbol.toUpperCase()} successfully listed!`);
      setNewStock({ symbol: '', name: '', price: '', sector: 'Technology', description: '', isFeatured: false });
      fetchData();
      setTimeout(() => {
        setShowAddStockModal(false);
        setStockFormSuccess('');
      }, 1500);
    } catch (err) {
      setStockFormError(err.response?.data?.message || 'Failed to list stock.');
    }
  };

  const handleToggleHalt = async (stock) => {
    const nextStatus = stock.status === 'active' ? 'halted' : 'active';
    try {
      await adminAPI.updateStock(stock._id, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update stock status');
    }
  };

  const handleDeleteStock = async (id, symbol) => {
    if (window.confirm(`Are you sure you want to delist ${symbol}?`)) {
      try {
        await adminAPI.deleteStock(id);
        fetchData();
      } catch (err) {
        alert('Failed to delete stock');
      }
    }
  };

  // User Actions
  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await adminAPI.updateUser(user._id, { status: nextStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleAdjustBalance = async (userId, currentBalance) => {
    const input = prompt('Enter new virtual balance amount ($):', currentBalance);
    if (input !== null && !isNaN(parseFloat(input))) {
      try {
        await adminAPI.updateUser(userId, { virtualBalance: parseFloat(input) });
        fetchData();
      } catch (err) {
        alert('Failed to update balance');
      }
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="flex-between" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              padding: '0.4rem',
              borderRadius: '8px',
              display: 'flex'
            }}>
              <ShieldCheck size={22} />
            </span>
            <h1 style={{ fontSize: '2rem', margin: 0 }}>
              Administrator Moderation Center
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.35rem' }}>
            Manage equity listings, oversee user portfolios, and audit system-wide trade executions.
          </p>
        </div>

        <button
          onClick={() => setShowAddStockModal(true)}
          className="btn btn-bull"
        >
          <Plus size={18} /> Add New Stock Listing
        </button>
      </div>

      {/* Stats Cards Banner */}
      {stats && (
        <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card stat-cyan">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Traders Registered
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-main)', margin: '0.25rem 0' }}>
              {stats.totalUsers}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Active platform accounts
            </div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
              Market Listings
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-main)', margin: '0.25rem 0' }}>
              {stats.totalStocks}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {stats.activeStocks} Active / {stats.haltedStocks} Halted
            </div>
          </div>

          <div className="stat-card stat-bull">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
              Platform Trades
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#10b981', margin: '0.25rem 0' }}>
              {stats.totalTransactions}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {stats.completedTrades} Completed
            </div>
          </div>

          <div className="stat-card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
              Total Trade Volume
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-main)', margin: '0.25rem 0' }}>
              ${stats.totalTradeVolume?.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Simulated capital traded
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="tabs-header" style={{ marginBottom: '1.75rem', maxWidth: 500 }}>
        <button
          onClick={() => setActiveTab('stocks')}
          className={`tab-btn ${activeTab === 'stocks' ? 'active' : ''}`}
        >
          Manage Stocks ({stocks.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
        >
          Manage Users ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
        >
          All Trades ({transactions.length})
        </button>
      </div>

      {/* TAB 1: STOCKS MANAGEMENT */}
      {activeTab === 'stocks' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Listed Equities</h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Symbol & Name</th>
                  <th>Sector</th>
                  <th>Price</th>
                  <th>24h Change</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map(stock => (
                  <tr key={stock._id || stock.symbol}>
                    <td>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>
                          {stock.symbol}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {stock.name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-neutral">{stock.sector}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                        ${stock.price?.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={stock.changePercent >= 0 ? 'badge-bull' : 'badge-bear'}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: stock.status === 'active' ? '#10b981' : '#f43f5e'
                      }}>
                        {stock.status === 'active' ? 'Active' : 'Halted'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleToggleHalt(stock)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          title={stock.status === 'active' ? 'Halt Trading' : 'Resume Trading'}
                        >
                          {stock.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                          {stock.status === 'active' ? 'Halt' : 'Resume'}
                        </button>
                        <button
                          onClick={() => handleDeleteStock(stock._id, stock.symbol)}
                          className="btn btn-bear btn-sm"
                          style={{ padding: '0.3rem 0.5rem' }}
                          title="Delist Stock"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Platform Users</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Virtual Cash Balance</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={u.role === 'ADMIN' ? 'badge-bull' : 'badge-neutral'} style={{ fontSize: '0.75rem' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#10b981' }}>
                        ${u.virtualBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: u.status === 'active' ? '#10b981' : '#f43f5e'
                      }}>
                        {u.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleAdjustBalance(u._id, u.virtualBalance)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                        >
                          <DollarSign size={13} /> Adjust Funds
                        </button>
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleUserStatus(u)}
                            className={`btn btn-sm ${u.status === 'active' ? 'btn-bear' : 'btn-bull'}`}
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>All System Transactions</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Trader</th>
                  <th>Ticker</th>
                  <th>Order Type</th>
                  <th>Shares</th>
                  <th>Unit Price</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t._id}>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {t.user?.name || 'Trader'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800 }}>{t.symbol}</span>
                    </td>
                    <td>
                      <span className={t.type === 'BUY' ? 'badge-bull' : 'badge-bear'}>
                        {t.type}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono' }}>{t.quantity}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono' }}>${t.price?.toFixed(2)}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                        ${t.totalAmount?.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span className="badge-bull">{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStockModal && (
        <div className="modal-overlay" onClick={() => setShowAddStockModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>List New Equity</h3>

            {stockFormError && (
              <div style={{ color: '#fb7185', background: 'rgba(244, 63, 94, 0.1)', padding: '0.65rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>
                {stockFormError}
              </div>
            )}
            {stockFormSuccess && (
              <div style={{ color: '#34d399', background: 'rgba(16, 185, 129, 0.1)', padding: '0.65rem', borderRadius: 8, marginBottom: '1rem', fontSize: '0.85rem' }}>
                {stockFormSuccess}
              </div>
            )}

            <form onSubmit={handleCreateStock} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Ticker Symbol</label>
                <input
                  type="text"
                  placeholder="e.g. NFLX"
                  value={newStock.symbol}
                  onChange={e => setNewStock({ ...newStock, symbol: e.target.value.toUpperCase() })}
                  className="input-control"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Company / Asset Name</label>
                <input
                  type="text"
                  placeholder="e.g. Netflix Inc."
                  value={newStock.name}
                  onChange={e => setNewStock({ ...newStock, name: e.target.value })}
                  className="input-control"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Initial Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="650.00"
                    value={newStock.price}
                    onChange={e => setNewStock({ ...newStock, price: e.target.value })}
                    className="input-control"
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Sector</label>
                  <select
                    value={newStock.sector}
                    onChange={e => setNewStock({ ...newStock, sector: e.target.value })}
                    className="input-control"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Crypto">Crypto</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief company business model..."
                  value={newStock.description}
                  onChange={e => setNewStock({ ...newStock, description: e.target.value })}
                  className="input-control"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={newStock.isFeatured}
                  onChange={e => setNewStock({ ...newStock, isFeatured: e.target.checked })}
                />
                <label htmlFor="featuredCheck" style={{ fontSize: '0.85rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  Pin as Featured Stock on Homepage
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddStockModal(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-bull" style={{ flex: 1 }}>
                  List Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
