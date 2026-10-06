import React, { useState } from 'react';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';
import StockCard from '../components/StockCard';
import TradeModal from '../components/TradeModal';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  BarChart3,
  Award,
  ArrowRight,
  Compass,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

const Home = () => {
  const { stocks, featuredStocks, marketOverview } = useMarket();
  const { isAuthenticated, loginDemoTrader, loginDemoAdmin } = useAuth();
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleTradeClick = (stock) => {
    setSelectedStock(stock);
    setTradeModalOpen(true);
  };

  const handleDemoStart = async () => {
    if (!isAuthenticated) {
      await loginDemoTrader();
    }
    navigate('/portfolio');
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '3rem 0 4rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          color: '#818cf8',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem'
        }}>
          <Zap size={15} /> Real-Time MERN Stock Trading Simulation
        </div>

        <h1 style={{
          fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
          maxWidth: 900,
          margin: '0 auto 1.25rem',
          fontWeight: 800
        }}>
          Master the Markets with{' '}
          <span style={{
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 50%, #6366f1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Zero Financial Risk
          </span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: 'var(--text-muted)',
          maxWidth: 680,
          margin: '0 auto 2.25rem',
          lineHeight: 1.6
        }}>
          Explore live stock market movements, execute instantaneous simulated trades, and test investment strategies with <strong>$50,000 in virtual trading capital</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={handleDemoStart} className="btn btn-primary btn-lg">
            <DollarSign size={18} /> Start Virtual Trading Now
          </button>
          <Link to="/market" className="btn btn-outline btn-lg">
            <Compass size={18} /> Explore Market Equities <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Market Overview Live Banner */}
      {marketOverview && (
        <section style={{ marginBottom: '3.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.75rem',
              alignItems: 'center'
            }}>
              {/* Composite Index */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  TradeEZ Composite 100
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-main)', margin: '0.2rem 0' }}>
                  {marketOverview.indexValue?.toLocaleString()}
                </div>
                <span className={marketOverview.avgChangePercent >= 0 ? 'badge-bull' : 'badge-bear'}>
                  {marketOverview.avgChangePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {marketOverview.avgChangePercent >= 0 ? '+' : ''}{marketOverview.avgChangePercent}% Today
                </span>
              </div>

              {/* Total Volume */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  24h Simulated Volume
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-main)', margin: '0.2rem 0' }}>
                  {marketOverview.totalVolume ? (marketOverview.totalVolume / 1000000).toFixed(1) + 'M Shares' : 'N/A'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Across {marketOverview.activeStockCount} Active Listings
                </div>
              </div>

              {/* Top Gainer */}
              {marketOverview.topGainers?.[0] && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Top Market Gainer
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.2rem 0' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {marketOverview.topGainers[0].symbol}
                    </span>
                    <span className="badge-bull">
                      +{marketOverview.topGainers[0].changePercent?.toFixed(2)}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    ${marketOverview.topGainers[0].price?.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Top Loser */}
              {marketOverview.topLosers?.[0] && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Biggest Dip
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.2rem 0' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {marketOverview.topLosers[0].symbol}
                    </span>
                    <span className="badge-bear">
                      {marketOverview.topLosers[0].changePercent?.toFixed(2)}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
                    ${marketOverview.topLosers[0].price?.toFixed(2)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Featured Stocks Grid */}
      <section style={{ marginBottom: '4rem' }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>
              Featured Equities & Digital Assets
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Top tracked tickers with high liquidity and active real-time volatility.
            </p>
          </div>
          <Link to="/market" className="btn btn-outline btn-sm">
            View All ({stocks.length}) <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid-cols-4">
          {featuredStocks.slice(0, 8).map(stock => (
            <StockCard key={stock._id || stock.symbol} stock={stock} onTradeClick={handleTradeClick} />
          ))}
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            Built for Smart Trading Exploration
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            A complete trading infrastructure engineered with the full MERN stack.
          </p>
        </div>

        <div className="grid-cols-3">
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Zap size={24} color="#10b981" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>
              Real-Time Market Engine
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Experience live price ticks and dynamic volume fluctuations using automated polling and real-time Brownian motion market algorithms.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <BarChart3 size={24} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>
              Dynamic Chart.js Analytics
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Inspect customizable trend charts with 1D, 1W, 1M, and historical intervals, complemented by deep fundamental statistics and ratios.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '2rem' }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Shield size={24} color="#06b6d4" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>
              Role-Based JWT Security
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Protected endpoints with bcrypt password encryption, JWT session tokens, and a full administrator dashboard for market governance.
            </p>
          </div>
        </div>
      </section>

      {/* Trade Modal Popup */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialType="BUY"
      />
    </div>
  );
};

export default Home;
