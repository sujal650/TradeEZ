import React from 'react';
import { useMarket } from '../context/MarketContext';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const TickerTape = () => {
  const { stocks } = useMarket();

  if (!stocks || stocks.length === 0) return null;

  // Duplicate list so the marquee loops seamlessly
  const tickerItems = [...stocks, ...stocks];

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.95)',
      borderBottom: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      padding: '0.45rem 0',
      fontSize: '0.825rem'
    }}>
      <div className="marquee-track">
        {tickerItems.map((s, idx) => {
          const isUp = (s.changePercent || 0) >= 0;
          return (
            <Link
              key={`${s.symbol}-${idx}`}
              to={`/stock/${s.symbol}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginRight: '2rem',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.symbol}</span>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
                ${s.price.toFixed(2)}
              </span>
              <span className={isUp ? 'badge-bull' : 'badge-bear'} style={{ padding: '0.1rem 0.45rem', fontSize: '0.72rem' }}>
                {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {isUp ? '+' : ''}{s.changePercent?.toFixed(2)}%
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TickerTape;
