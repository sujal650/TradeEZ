const store = require('../services/store');

// @desc    Execute a BUY or SELL trade
// @route   POST /api/trades/execute
// @access  Private
const executeTrade = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { symbol, type, quantity } = req.body;

    // 1. Validation
    if (!symbol || !type || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide stock symbol, trade type (BUY/SELL), and quantity.'
      });
    }

    const tradeType = type.toUpperCase();
    if (!['BUY', 'SELL'].includes(tradeType)) {
      return res.status(400).json({
        success: false,
        message: 'Trade type must be either BUY or SELL.'
      });
    }

    const numShares = parseInt(quantity, 10);
    if (isNaN(numShares) || numShares <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive whole number.'
      });
    }

    // 2. Fetch stock and user
    const stock = await store.findStockBySymbol(symbol);
    if (!stock) {
      return res.status(404).json({
        success: false,
        message: `Stock '${symbol.toUpperCase()}' not found.`
      });
    }

    if (stock.status === 'halted') {
      return res.status(400).json({
        success: false,
        message: `Trading for '${stock.symbol}' is currently halted by the market administrator.`
      });
    }

    const user = await store.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    const currentPrice = Number(stock.price);
    const totalAmount = parseFloat((currentPrice * numShares).toFixed(2));
    const portfolio = await store.getPortfolioByUserId(userId);
    const existingHolding = portfolio.holdings.find(
      h => h.symbol.toUpperCase() === stock.symbol.toUpperCase()
    );

    // 3. Process BUY
    if (tradeType === 'BUY') {
      if (user.virtualBalance < totalAmount) {
        return res.status(400).json({
          success: false,
          message: `Insufficient virtual funds. Trade cost is $${totalAmount.toLocaleString()}, but your balance is $${user.virtualBalance.toLocaleString()}.`
        });
      }

      // Deduct balance
      const newBalance = parseFloat((user.virtualBalance - totalAmount).toFixed(2));
      await store.updateUser(userId, { virtualBalance: newBalance });

      // Update holding
      if (existingHolding) {
        const newQuantity = existingHolding.quantity + numShares;
        const newTotalInvested = parseFloat((existingHolding.totalInvested + totalAmount).toFixed(2));
        existingHolding.quantity = newQuantity;
        existingHolding.totalInvested = newTotalInvested;
        existingHolding.averageBuyPrice = parseFloat((newTotalInvested / newQuantity).toFixed(2));
      } else {
        portfolio.holdings.push({
          stock: stock._id,
          symbol: stock.symbol,
          stockName: stock.name,
          quantity: numShares,
          averageBuyPrice: currentPrice,
          totalInvested: totalAmount
        });
      }
    }

    // 4. Process SELL
    if (tradeType === 'SELL') {
      if (!existingHolding || existingHolding.quantity < numShares) {
        const owned = existingHolding ? existingHolding.quantity : 0;
        return res.status(400).json({
          success: false,
          message: `Cannot sell ${numShares} shares of ${stock.symbol}. You only hold ${owned} shares.`
        });
      }

      // Add to balance
      const newBalance = parseFloat((user.virtualBalance + totalAmount).toFixed(2));
      await store.updateUser(userId, { virtualBalance: newBalance });

      // Update holding
      const remainingQty = existingHolding.quantity - numShares;
      if (remainingQty === 0) {
        // Sold all shares
        portfolio.holdings = portfolio.holdings.filter(
          h => h.symbol.toUpperCase() !== stock.symbol.toUpperCase()
        );
      } else {
        // Proportionally reduce invested basis
        const unitCost = existingHolding.averageBuyPrice;
        existingHolding.quantity = remainingQty;
        existingHolding.totalInvested = parseFloat((unitCost * remainingQty).toFixed(2));
      }
    }

    // 5. Recalculate Portfolio Values
    let totalInvested = 0;
    let totalPortfolioValue = 0;
    for (const h of portfolio.holdings) {
      totalInvested += h.totalInvested;
      // Get current price if available, otherwise buy price
      const s = await store.findStockBySymbol(h.symbol);
      const curPrice = s ? s.price : h.averageBuyPrice;
      totalPortfolioValue += curPrice * h.quantity;
    }

    portfolio.totalInvested = parseFloat(totalInvested.toFixed(2));
    portfolio.totalPortfolioValue = parseFloat(totalPortfolioValue.toFixed(2));
    portfolio.totalProfitLoss = parseFloat((portfolio.totalPortfolioValue - portfolio.totalInvested).toFixed(2));
    portfolio.totalProfitLossPercent = portfolio.totalInvested > 0
      ? parseFloat(((portfolio.totalProfitLoss / portfolio.totalInvested) * 100).toFixed(2))
      : 0;

    await store.savePortfolio(portfolio);

    // 6. Record Transaction
    const transaction = await store.createTransaction({
      user: userId,
      stock: stock._id,
      symbol: stock.symbol,
      stockName: stock.name,
      type: tradeType,
      quantity: numShares,
      price: currentPrice,
      totalAmount,
      status: 'COMPLETED',
      timestamp: new Date(),
      notes: `Executed simulated ${tradeType} for ${numShares} shares of ${stock.symbol} @ $${currentPrice}`
    });

    // 7. Get fresh user balance
    const updatedUser = await store.findUserById(userId);

    res.status(200).json({
      success: true,
      message: `Successfully executed ${tradeType} of ${numShares} ${stock.symbol} for $${totalAmount.toLocaleString()}!`,
      data: {
        transaction,
        virtualBalance: updatedUser.virtualBalance,
        portfolioSummary: {
          totalPortfolioValue: portfolio.totalPortfolioValue,
          totalInvested: portfolio.totalInvested,
          totalProfitLoss: portfolio.totalProfitLoss,
          totalProfitLossPercent: portfolio.totalProfitLossPercent
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user transaction history
// @route   GET /api/trades/history
// @access  Private
const getUserTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const limit = parseInt(req.query.limit, 10) || 50;
    const transactions = await store.getTransactionsByUserId(userId, limit);

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  executeTrade,
  getUserTransactions
};
