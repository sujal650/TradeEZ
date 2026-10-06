const store = require('../services/store');

// @desc    Get user's portfolio with live market valuations
// @route   GET /api/portfolio
// @access  Private
const getPortfolio = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await store.findUserById(userId);
    const portfolio = await store.getPortfolioByUserId(userId);

    const enrichedHoldings = [];
    let totalCurrentValue = 0;
    let totalInvested = 0;

    for (const h of portfolio.holdings) {
      const stock = await store.findStockBySymbol(h.symbol);
      const currentPrice = stock ? stock.price : h.averageBuyPrice;
      const currentValue = parseFloat((h.quantity * currentPrice).toFixed(2));
      const pnl = parseFloat((currentValue - h.totalInvested).toFixed(2));
      const pnlPercent = h.totalInvested > 0
        ? parseFloat(((pnl / h.totalInvested) * 100).toFixed(2))
        : 0;

      totalCurrentValue += currentValue;
      totalInvested += h.totalInvested;

      enrichedHoldings.push({
        stockId: h.stock,
        symbol: h.symbol,
        stockName: h.stockName || (stock ? stock.name : h.symbol),
        quantity: h.quantity,
        averageBuyPrice: h.averageBuyPrice,
        totalInvested: h.totalInvested,
        currentPrice,
        currentValue,
        profitLoss: pnl,
        profitLossPercent: pnlPercent,
        sector: stock ? stock.sector : 'Other',
        change24h: stock ? stock.changePercent : 0
      });
    }

    const totalProfitLoss = parseFloat((totalCurrentValue - totalInvested).toFixed(2));
    const totalProfitLossPercent = totalInvested > 0
      ? parseFloat(((totalProfitLoss / totalInvested) * 100).toFixed(2))
      : 0;
    const netWorth = parseFloat(((user.virtualBalance || 0) + totalCurrentValue).toFixed(2));

    // Asset allocation breakdown for pie/doughnut charts
    const allocation = enrichedHoldings.map(h => ({
      symbol: h.symbol,
      value: h.currentValue,
      percentage: totalCurrentValue > 0
        ? parseFloat(((h.currentValue / totalCurrentValue) * 100).toFixed(1))
        : 0
    }));

    res.status(200).json({
      success: true,
      data: {
        cashBalance: user.virtualBalance || 0,
        portfolioValue: parseFloat(totalCurrentValue.toFixed(2)),
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        netWorth,
        totalProfitLoss,
        totalProfitLossPercent,
        holdingsCount: enrichedHoldings.length,
        holdings: enrichedHoldings,
        allocation
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPortfolio
};
