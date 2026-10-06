import React, { useState, useMemo } from 'react';
import { useMarket } from '../context/MarketContext';
import StockCard from '../components/StockCard';
import TradeModal from '../components/TradeModal';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
  ArrowUpDown,
  Sparkles
} from 'lucide-react';

const SECTORS = ['ALL', 'Technology', 'Finance', 'Consumer', 'Automotive', 'Crypto'];

const Market = () => {
  const { stocks, loading } = useMarket();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [sortBy, setSortBy] = useState('volume');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      );
    }

    // Sector filter
    if (selectedSector !== 'ALL') {
      result = result.filter(
        s => s.sector.toLowerCase() === selectedSector.toLowerCase()
      );
    }

    // Sorting
    if (sortBy === 'gainers') {
      result.sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
    } else if (sortBy === 'losers') {
      result.sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0));
    } else if (sortBy === 'volume') {
      result.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.symbol.localeCompare(b.symbol));
    }

    return result;
  }, [stocks, searchQuery, selectedSector, sortBy]);

  const handleOpenTrade = (stock) => {
    setSelectedStock(stock);
    setTradeModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
          Market Explorer & Live Equities
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Real-time price quotes, fundamental metrics, and trade simulations across global tickers.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Input */}
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: 450 }}>
            <Search size={18} color="var(--text-faint)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by symbol or company (e.g. AAPL, NVIDIA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-control"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          {/* Controls Right */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Sort Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowUpDown size={16} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-control"
                style={{ padding: '0.6rem 1rem', width: 'auto', minWidth: 170 }}
              >
                <option value="volume">Highest Volume</option>
                <option value="gainers">Top Gainers (%)</option>
                <option value="losers">Top Losers (%)</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="name">Ticker Symbol (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.8)',
              padding: '0.2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '0.4rem 0.6rem' }}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none', padding: '0.4rem 0.6rem' }}
                title="Table View"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sector Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1.25rem',
          flexWrap: 'wrap',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '1rem'
        }}>
          {SECTORS.map(sec => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              style={{
                background: selectedSector === sec ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: selectedSector === sec ? '#ffffff' : 'var(--text-muted)',
                border: selectedSector === sec ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Results Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading live market feeds...
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Search size={40} color="var(--text-faint)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No matching tickers found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Try adjusting your search criteria or resetting sector filters.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid-cols-4">
          {filteredStocks.map(stock => (
            <StockCard
              key={stock._id || stock.symbol}
              stock={stock}
              onTradeClick={handleOpenTrade}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="glass-panel" style={{ overflowX: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ticker & Company</th>
                <th>Sector</th>
                <th>Price</th>
                <th>24h Change</th>
                <th>Day Range</th>
                <th>Volume</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map(stock => {
                const isBull = (stock.changePercent || 0) >= 0;
                return (
                  <tr key={stock._id || stock.symbol}>
                    <td>
                      <Link to={`/stock/${stock.symbol}`} style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>
                          {stock.symbol}
                        </span>
                        <span style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
                          {stock.name}
                        </span>
                      </Link>
                    </td>
                    <td>
                      <span className="badge-neutral" style={{ fontSize: '0.75rem' }}>
                        {stock.sector}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '0.95rem' }}>
                        ${stock.price?.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className={isBull ? 'badge-bull' : 'badge-bear'}>
                        {isBull ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isBull ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                        ${stock.low?.toFixed(2)} - ${stock.high?.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                        {stock.volume ? (stock.volume / 1000000).toFixed(2) + 'M' : '0'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleOpenTrade(stock)}
                          className="btn btn-bull btn-sm"
                          style={{ padding: '0.35rem 0.75rem' }}
                        >
                          Trade
                        </button>
                        <Link
                          to={`/stock/${stock.symbol}`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          Chart
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialType="BUY"
      />
    </div>
  );
};

export default Market;
