import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const StockChart = ({ stock }) => {
  const [timeRange, setTimeRange] = useState('1M'); // '1D', '1W', '1M', 'ALL'

  const chartDataPoints = useMemo(() => {
    if (!stock?.historicalData || stock.historicalData.length === 0) {
      return [];
    }

    const data = [...stock.historicalData];
    if (timeRange === '1D') {
      return data.slice(-8);
    } else if (timeRange === '1W') {
      return data.slice(-14);
    } else if (timeRange === '1M') {
      return data.slice(-30);
    }
    return data;
  }, [stock, timeRange]);

  const isBullish = useMemo(() => {
    if (chartDataPoints.length < 2) return true;
    const first = chartDataPoints[0].price;
    const last = chartDataPoints[chartDataPoints.length - 1].price;
    return last >= first;
  }, [chartDataPoints]);

  const primaryColor = isBullish ? '#10b981' : '#f43f5e';
  const gradientColorStop = isBullish ? 'rgba(16, 185, 129, 0.22)' : 'rgba(244, 63, 94, 0.22)';

  const labels = chartDataPoints.map(point => {
    const d = new Date(point.timestamp);
    return timeRange === '1D'
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  });

  const prices = chartDataPoints.map(point => point.price);

  const data = {
    labels,
    datasets: [
      {
        label: `${stock?.symbol} Price ($)`,
        data: prices,
        borderColor: primaryColor,
        borderWidth: 2.5,
        pointRadius: chartDataPoints.length > 25 ? 0 : 2,
        pointHoverRadius: 5,
        pointBackgroundColor: primaryColor,
        tension: 0.35,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, gradientColorStop);
          gradient.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
          return gradient;
        }
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#34d399',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => ` Price: $${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.03)' },
        ticks: { color: '#64748b', maxTicksLimit: 7, font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: {
          color: '#64748b',
          font: { size: 11, family: 'JetBrains Mono' },
          callback: (val) => `$${val}`
        }
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Time-range Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem', marginBottom: '1rem' }}>
        {['1D', '1W', '1M', 'ALL'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            style={{
              background: timeRange === range ? 'var(--bg-elevated)' : 'transparent',
              color: timeRange === range ? '#ffffff' : 'var(--text-faint)',
              border: timeRange === range ? '1px solid var(--border-hover)' : '1px solid transparent',
              padding: '0.25rem 0.65rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {range}
          </button>
        ))}
      </div>

      <div style={{ height: 350, width: '100%', position: 'relative' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default StockChart;
