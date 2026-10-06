import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

const StockCard = ({ stock, onTradeClick }) => {
  const isBull = (stock.changePercent || 0) >= 0;

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans', color: 'var(--text-main)' }}>
              {stock.symbol}
            </span>
            <span className="badge-neutral" style={{ fontSize: '0.7rem' }}>
              {stock.sector}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>
            {stock.name}
          </div>
        </div>

        <span className={isBull ? 'badge-bull' : 'badge-bear'}>
          {isBull ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {isBull ? '+' : ''}{stock.changePercent?.toFixed(2)}%
        </span>
      </div>

      <div style={{ marginBottom: '1.25rem', marginTop: 'auto' }}>
        <div style={{ fontSize: '1.45rem', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-main)' }}>
          ${stock.price?.toFixed(2)}
        </div>
        <div style={{ fontSize: '0.75rem', color: isBull ? 'var(--bull-green)' : 'var(--bear-red)', marginTop: '0.2rem' }}>
          {isBull ? '+' : ''}${stock.change?.toFixed(2)} Today
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <Link
          to={`/stock/${stock.symbol}`}
          className="btn btn-outline btn-sm"
          style={{ flex: 1, padding: '0.45rem' }}
        >
          Details <ArrowRight size={14} />
        </Link>
        <button
          onClick={() => onTradeClick && onTradeClick(stock)}
          className="btn btn-bull btn-sm"
          style={{ flex: 1, padding: '0.45rem' }}
        >
          Trade
        </button>
      </div>
    </div>
  );
};

export default StockCard;
