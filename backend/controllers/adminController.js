const store = require('../services/store');

// @desc    Get system-wide overview statistics for admin
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const users = await store.getAllUsers();
    const stocks = await store.getAllStocks();
    const transactions = await store.getAllTransactions(500);

    const totalTradeVolume = transactions.reduce((acc, t) => acc + (t.totalAmount || 0), 0);
    const completedTrades = transactions.filter(t => t.status === 'COMPLETED').length;
    const pendingTrades = transactions.filter(t => t.status === 'PENDING_APPROVAL').length;
    const activeStocks = stocks.filter(s => s.status === 'active').length;
    const haltedStocks = stocks.filter(s => s.status === 'halted').length;

    res.status(200).json({
      success: true,
      data: {
        totalUsers: users.length,
        totalStocks: stocks.length,
        activeStocks,
        haltedStocks,
        totalTransactions: transactions.length,
        completedTrades,
        pendingTrades,
        totalTradeVolume: parseFloat(totalTradeVolume.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await store.getAllUsers();
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (active / suspended) or role
// @route   PATCH /api/admin/users/:id
// @access  Private (Admin)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, role, virtualBalance } = req.body;

    const updates = {};
    if (status) updates.status = status;
    if (role) updates.role = role;
    if (virtualBalance !== undefined) updates.virtualBalance = parseFloat(virtualBalance);

    const updated = await store.updateUser(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new stock listing
// @route   POST /api/admin/stocks
// @access  Private (Admin)
const createStock = async (req, res, next) => {
  try {
    const { symbol, name, price, sector, description, isFeatured } = req.body;

    if (!symbol || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Symbol, company name, and initial price are required.'
      });
    }

    const existing = await store.findStockBySymbol(symbol);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Stock with symbol '${symbol.toUpperCase()}' already exists.`
      });
    }

    const numPrice = parseFloat(price);
    const newStock = await store.createStock({
      symbol: symbol.toUpperCase().trim(),
      name: name.trim(),
      price: numPrice,
      previousClose: numPrice,
      change: 0,
      changePercent: 0,
      open: numPrice,
      high: numPrice,
      low: numPrice,
      volume: 1000000,
      marketCap: numPrice * 10000000,
      sector: sector || 'Technology',
      description: description || '',
      isFeatured: !!isFeatured,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: `Stock ${newStock.symbol} listed successfully!`,
      data: newStock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock information or halt/resume
// @route   PATCH /api/admin/stocks/:id
// @access  Private (Admin)
const updateStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, sector, status, isFeatured, description } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (price !== undefined) {
      const p = parseFloat(price);
      updates.price = p;
    }
    if (sector) updates.sector = sector;
    if (status) updates.status = status;
    if (isFeatured !== undefined) updates.isFeatured = !!isFeatured;
    if (description !== undefined) updates.description = description;

    const updated = await store.updateStock(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Stock not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete stock listing
// @route   DELETE /api/admin/stocks/:id
// @access  Private (Admin)
const deleteStock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await store.deleteStock(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Stock not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Stock ${deleted.symbol} removed successfully.`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions across platform
// @route   GET /api/admin/transactions
// @access  Private (Admin)
const getAllTransactions = async (req, res, next) => {
  try {
    const transactions = await store.getAllTransactions(100);
    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate transaction (Approve / Reject)
// @route   PATCH /api/admin/transactions/:id/moderate
// @access  Private (Admin)
const moderateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['COMPLETED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'COMPLETED' or 'REJECTED'."
      });
    }

    const updated = await store.updateTransactionStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    res.status(200).json({
      success: true,
      message: `Transaction ${id} marked as ${status}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  updateUser,
  createStock,
  updateStock,
  deleteStock,
  getAllTransactions,
  moderateTransaction
};
