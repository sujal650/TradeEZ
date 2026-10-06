import React, { useState, useEffect } from 'react';
import { portfolioAPI, stockAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TradeModal from '../components/TradeModal';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  DollarSign,
  ArrowUpRight,
  Briefcase,
  AlertCircle,
  Plus
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const Portfolio = () => {
  const { user, refreshUser } = useAuth();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [initialTradeType, setInitialTradeType] = useState('BUY');

  const fetchPortfolio = async (isInitial = false) => {
    try {
      const res = await portfolioAPI.getPortfolio();
      setPortfolioData(res.data.data);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio(true);
    // Poll portfolio every 4 seconds to reflect market price movements
    const interval = setInterval(() => {
      fetchPortfolio(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenTrade = async (symbol, type) => {
    try {
      const stockRes = await stockAPI.getBySymbol(symbol);
      setSelectedStock(stockRes.data.data);
      setInitialTradeType(type);
      setTradeModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        Calculating real-time portfolio valuation...
      </div>
    );
  }

  const holdings = portfolioData?.holdings || [];
  const isNetProfit = (portfolioData?.totalProfitLoss || 0) >= 0;

  // Chart data for asset allocation
  const doughnutLabels = holdings.map(h => h.symbol);
  const doughnutValues = holdings.map(h => h.currentValue);
  const chartColors = [
    '#6366f1', '#10b981', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'
  ];

  const doughnutData = {
    labels: doughnutLabels.length > 0 ? doughnutLabels : ['Cash Balance'],
    datasets: [
      {
        data: doughnutValues.length > 0 ? doughnutValues : [portfolioData?.cashBalance || 50000],
        backgroundColor: doughnutValues.length > 0 ? chartColors.slice(0, doughnutValues.length) : ['#10b981'],
        borderColor: '#0f172a',
        borderWidth: 2
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94a3b8',
          font: { size: 12, family: 'Inter' },
          padding: 12
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => ` ${context.label}: $${context.raw?.toLocaleString()}`
        }
      }
    },
    cutout: '70%'
  };

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>
          Portfolio & Holdings Overview
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Real-time marked-to-market performance, asset allocation, and capital growth metrics.
        </p>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid-cols-4" style={{ marginBottom: '2.5rem' }}>
        {/* Net Worth */}
        <div className="stat-card stat-cyan">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Net Worth
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-main)', margin: '0.35rem 0' }}>
            ${portfolioData?.netWorth?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Cash + Portfolio Equity
          </div>
        </div>

        {/* Portfolio Value */}
        <div className="stat-card">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Equity Holdings Value
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: 'var(--text-main)', margin: '0.35rem 0' }}>
            ${portfolioData?.portfolioValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Invested basis: ${portfolioData?.totalInvested?.toLocaleString()}
          </div>
        </div>

        {/* Total Profit / Loss */}
        <div className={`stat-card ${isNetProfit ? 'stat-bull' : 'stat-bear'}`}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Profit / Loss
          </div>
          <div style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono',
            color: isNetProfit ? 'var(--bull-green)' : 'var(--bear-red)',
            margin: '0.35rem 0'
          }}>
            {isNetProfit ? '+' : ''}${portfolioData?.totalProfitLoss?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className={isNetProfit ? 'badge-bull' : 'badge-bear'}>
            {isNetProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isNetProfit ? '+' : ''}{portfolioData?.totalProfitLossPercent}% All Time
          </span>
        </div>

        {/* Available Cash Balance */}
        <div className="stat-card stat-bull">
          <div style={{ fontSize: '0.75rem', color: 'var(--text-faint)', textTransform: 'uppercase', fontWeight: 600 }}>
            Available Cash
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'JetBrains Mono', color: '#10b981', margin: '0.35rem 0' }}>
            ${portfolioData?.cashBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Virtual liquid buying power
          </div>
        </div>
      </div>

      {/* Allocation Chart + Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem'
      }}>
        {/* Doughnut Chart */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieIcon size={18} color="var(--accent-primary)" /> Asset Allocation
          </h3>
          <div style={{ height: 260, position: 'relative' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Portfolio Stats Insight */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>
              Investment Strategy Insights
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Your portfolio consists of <strong>{holdings.length} active positions</strong>. Positions are re-evaluated continuously against live order book simulations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="flex-between" style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Liquid Cash Ratio:</span>
                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                  {portfolioData?.netWorth > 0
                    ? ((portfolioData.cashBalance / portfolioData.netWorth) * 100).toFixed(1) + '%'
                    : '100%'}
                </span>
              </div>
              <div className="flex-between" style={{ fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Stock Holdings Ratio:</span>
                <span style={{ fontWeight: 700, fontFamily: 'JetBrains Mono' }}>
                  {portfolioData?.netWorth > 0
                    ? ((portfolioData.portfolioValue / portfolioData.netWorth) * 100).toFixed(1) + '%'
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/market" className="btn btn-primary" style={{ flex: 1 }}>
              <Plus size={16} /> Buy More Equities
            </Link>
            <Link to="/transactions" className="btn btn-outline" style={{ flex: 1 }}>
              View Trade Log
            </Link>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
          Current Active Holdings ({holdings.length})
        </h3>

        {holdings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Briefcase size={44} color="var(--text-faint)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Active Holdings</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: 450, margin: '0 auto 1.5rem' }}>
              You haven't purchased any stocks yet. Explore the market and use your $50,000 in virtual funds to start your portfolio!
            </p>
            <Link to="/market" className="btn btn-primary">
              Explore Live Stocks
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Ticker</th>
                  <th>Shares Owned</th>
                  <th>Avg Buy Price</th>
                  <th>Current Price</th>
                  <th>Market Value</th>
                  <th>Profit / Loss</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => {
                  const isProfit = (h.profitLoss || 0) >= 0;
                  return (
                    <tr key={h.symbol}>
                      <td>
                        <Link to={`/stock/${h.symbol}`} style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1.05rem' }}>
                            {h.symbol}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {h.stockName}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '0.95rem' }}>
                          {h.quantity}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>
                          ${h.averageBuyPrice?.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>
                          ${h.currentPrice?.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800 }}>
                          ${h.currentValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <div>
                          <span className={isProfit ? 'badge-bull' : 'badge-bear'}>
                            {isProfit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {isProfit ? '+' : ''}${h.profitLoss?.toFixed(2)} ({isProfit ? '+' : ''}{h.profitLossPercent}%)
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleOpenTrade(h.symbol, 'BUY')}
                            className="btn btn-bull btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Buy More
                          </button>
                          <button
                            onClick={() => handleOpenTrade(h.symbol, 'SELL')}
                            className="btn btn-bear btn-sm"
                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                          >
                            Sell
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trade Modal for quick actions */}
      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        stock={selectedStock}
        initialType={initialTradeType}
        onTradeSuccess={() => fetchPortfolio(false)}
      />
    </div>
  );
};

export default Portfolio;
