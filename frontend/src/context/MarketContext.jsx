import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { stockAPI } from '../services/api';

const MarketContext = createContext();

export const MarketProvider = ({ children }) => {
  const [stocks, setStocks] = useState([]);
  const [featuredStocks, setFeaturedStocks] = useState([]);
  const [marketOverview, setMarketOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchMarketData = useCallback(async (isInitial = false) => {
    try {
      const [stocksRes, overviewRes] = await Promise.all([
        stockAPI.getAll(),
        stockAPI.getMarketOverview()
      ]);

      const allStocks = stocksRes.data.data || [];
      setStocks(allStocks);
      setFeaturedStocks(allStocks.filter(s => s.isFeatured));
      setMarketOverview(overviewRes.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Market fetch failed:', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  // Polling every 3.5 seconds for live simulation updates
  useEffect(() => {
    fetchMarketData(true);
    const interval = setInterval(() => {
      fetchMarketData(false);
    }, 3500);

    return () => clearInterval(interval);
  }, [fetchMarketData]);

  const value = {
    stocks,
    featuredStocks,
    marketOverview,
    loading,
    lastUpdated,
    refreshStocks: () => fetchMarketData(false)
  };

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
