const store = require('../services/store');

// @desc    Get all stocks with filtering and sorting
// @route   GET /api/stocks
// @access  Public
const getAllStocks = async (req, res, next) => {
  try {
    const { sector, q, sortBy } = req.query;
    let stocks = await store.getAllStocks({ sector, q });

    // Handle in-memory sorting
    if (sortBy === 'gainers') {
      stocks = stocks.sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
    } else if (sortBy === 'losers') {
      stocks = stocks.sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0));
    } else if (sortBy === 'volume') {
      stocks = stocks.sort((a, b) => (b.volume || 0) - (a.volume || 0));
    } else if (sortBy === 'price_desc') {
      stocks = stocks.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'price_asc') {
      stocks = stocks.sort((a, b) => a.price - b.price);
    }

    res.status(200).json({
      success: true,
      count: stocks.length,
      data: stocks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured stocks for homepage
// @route   GET /api/stocks/featured
// @access  Public
const getFeaturedStocks = async (req, res, next) => {
  try {
    const all = await store.getAllStocks();
    const featured = all.filter(s => s.isFeatured);
    res.status(200).json({
      success: true,
      data: featured.length > 0 ? featured : all.slice(0, 6)
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single stock by symbol
// @route   GET /api/stocks/:symbol
// @access  Public
const getStockBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const stock = await store.findStockBySymbol(symbol);

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `Stock with symbol '${symbol.toUpperCase()}' not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: stock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get market stats, index, top movers
// @route   GET /api/stocks/market/overview
// @access  Public
const getMarketOverview = async (req, res, next) => {
  try {
    const stocks = await store.getAllStocks();
    if (!stocks || stocks.length === 0) {
      return res.status(200).json({ success: true, data: {} });
    }

    const sortedByChange = [...stocks].sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0));
    const topGainers = sortedByChange.slice(0, 3);
    const topLosers = [...sortedByChange].reverse().slice(0, 3);

    const totalVolume = stocks.reduce((acc, s) => acc + (s.volume || 0), 0);
    const avgChangePercent = (
      stocks.reduce((acc, s) => acc + (s.changePercent || 0), 0) / stocks.length
    ).toFixed(2);

    // Composite index simulation (TradeEZ Composite 100)
    const indexValue = (stocks.reduce((acc, s) => acc + s.price, 0) * 1.85).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        indexValue: parseFloat(indexValue),
        avgChangePercent: parseFloat(avgChangePercent),
        totalVolume,
        activeStockCount: stocks.length,
        topGainers,
        topLosers
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllStocks,
  getFeaturedStocks,
  getStockBySymbol,
  getMarketOverview
};
