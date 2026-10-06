const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const { defaultStocks, defaultUsers, generateHistory } = require('../seeds/seedData');

// In-Memory store fallback
const memoryStore = {
  users: [],
  stocks: [],
  transactions: [],
  portfolios: []
};

// Initialize in-memory store
const initMemoryStore = async () => {
  if (memoryStore.users.length === 0) {
    for (const u of defaultUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(u.password, salt);
      const userDoc = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: u.name,
        email: u.email.toLowerCase(),
        password: hashedPassword,
        role: u.role,
        virtualBalance: u.virtualBalance,
        status: u.status,
        avatar: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.users.push(userDoc);

      // Create portfolio
      memoryStore.portfolios.push({
        _id: new mongoose.Types.ObjectId().toString(),
        user: userDoc._id,
        holdings: [],
        totalPortfolioValue: 0,
        totalInvested: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    memoryStore.stocks = defaultStocks.map(s => ({
      _id: new mongoose.Types.ObjectId().toString(),
      ...JSON.parse(JSON.stringify(s)),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    console.log(`[Store] In-memory store initialized with ${memoryStore.stocks.length} stocks and ${memoryStore.users.length} default users.`);
  }
};

// Seed real MongoDB if connected and empty
const seedMongoIfEmpty = async () => {
  if (!getIsConnected()) return;
  try {
    const stockCount = await Stock.countDocuments();
    if (stockCount === 0) {
      console.log('[Store] Seeding default stocks to MongoDB...');
      await Stock.insertMany(defaultStocks);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Store] Seeding default users to MongoDB...');
      for (const u of defaultUsers) {
        const user = await User.create(u);
        await Portfolio.create({
          user: user._id,
          holdings: []
        });
      }
    }
  } catch (err) {
    console.error('[Store] Error seeding MongoDB:', err.message);
  }
};

// Unified Data Access API
const store = {
  init: async () => {
    await initMemoryStore();
    if (getIsConnected()) {
      await seedMongoIfEmpty();
    }
  },

  // USERS
  findUserByEmail: async (email) => {
    const cleanEmail = email.toLowerCase().trim();
    if (getIsConnected()) {
      return await User.findOne({ email: cleanEmail });
    }
    return memoryStore.users.find(u => u.email === cleanEmail);
  },

  findUserById: async (id) => {
    const idStr = id.toString();
    if (getIsConnected()) {
      return await User.findById(idStr);
    }
    return memoryStore.users.find(u => u._id.toString() === idStr);
  },

  createUser: async ({ name, email, password, role = 'USER', virtualBalance = 50000 }) => {
    const cleanEmail = email.toLowerCase().trim();
    if (getIsConnected()) {
      const user = await User.create({ name, email: cleanEmail, password, role, virtualBalance });
      await Portfolio.create({ user: user._id, holdings: [] });
      return user;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name,
      email: cleanEmail,
      password: hashedPassword,
      role,
      virtualBalance,
      status: 'active',
      avatar: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.users.push(newUser);
    memoryStore.portfolios.push({
      _id: new mongoose.Types.ObjectId().toString(),
      user: newUser._id,
      holdings: [],
      totalPortfolioValue: 0,
      totalInvested: 0,
      totalProfitLoss: 0,
      totalProfitLossPercent: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return newUser;
  },

  updateUser: async (id, updateData) => {
    const idStr = id.toString();
    if (getIsConnected()) {
      return await User.findByIdAndUpdate(idStr, updateData, { new: true });
    }
    const user = memoryStore.users.find(u => u._id.toString() === idStr);
    if (!user) return null;
    Object.assign(user, updateData, { updatedAt: new Date() });
    return user;
  },

  getAllUsers: async () => {
    if (getIsConnected()) {
      return await User.find().select('-password').sort({ createdAt: -1 });
    }
    return memoryStore.users.map(({ password, ...rest }) => rest);
  },

  // STOCKS
  getAllStocks: async (query = {}) => {
    if (getIsConnected()) {
      let filter = {};
      if (query.sector && query.sector !== 'ALL') {
        filter.sector = query.sector;
      }
      if (query.q) {
        const regex = new RegExp(query.q, 'i');
        filter.$or = [{ symbol: regex }, { name: regex }];
      }
      return await Stock.find(filter).sort({ symbol: 1 });
    }

    let result = [...memoryStore.stocks];
    if (query.sector && query.sector !== 'ALL') {
      result = result.filter(s => s.sector.toLowerCase() === query.sector.toLowerCase());
    }
    if (query.q) {
      const q = query.q.toLowerCase();
      result = result.filter(s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    return result;
  },

  findStockBySymbol: async (symbol) => {
    const sym = symbol.toUpperCase().trim();
    if (getIsConnected()) {
      return await Stock.findOne({ symbol: sym });
    }
    return memoryStore.stocks.find(s => s.symbol === sym);
  },

  findStockById: async (id) => {
    const idStr = id.toString();
    if (getIsConnected()) {
      return await Stock.findById(idStr);
    }
    return memoryStore.stocks.find(s => s._id.toString() === idStr);
  },

  createStock: async (stockData) => {
    const payload = {
      ...stockData,
      symbol: stockData.symbol.toUpperCase().trim(),
      historicalData: generateHistory(stockData.price, 30)
    };
    if (getIsConnected()) {
      return await Stock.create(payload);
    }
    const newStock = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.stocks.push(newStock);
    return newStock;
  },

  updateStock: async (id, updateData) => {
    const idStr = id.toString();
    if (getIsConnected()) {
      return await Stock.findByIdAndUpdate(idStr, updateData, { new: true });
    }
    const stock = memoryStore.stocks.find(s => s._id.toString() === idStr);
    if (!stock) return null;
    Object.assign(stock, updateData, { updatedAt: new Date() });
    return stock;
  },

  deleteStock: async (id) => {
    const idStr = id.toString();
    if (getIsConnected()) {
      return await Stock.findByIdAndDelete(idStr);
    }
    const idx = memoryStore.stocks.findIndex(s => s._id.toString() === idStr);
    if (idx !== -1) {
      return memoryStore.stocks.splice(idx, 1)[0];
    }
    return null;
  },

  // PORTFOLIOS
  getPortfolioByUserId: async (userId) => {
    const uid = userId.toString();
    if (getIsConnected()) {
      let p = await Portfolio.findOne({ user: uid }).populate('holdings.stock');
      if (!p) {
        p = await Portfolio.create({ user: uid, holdings: [] });
      }
      return p;
    }
    let p = memoryStore.portfolios.find(item => item.user.toString() === uid);
    if (!p) {
      p = {
        _id: new mongoose.Types.ObjectId().toString(),
        user: uid,
        holdings: [],
        totalPortfolioValue: 0,
        totalInvested: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      memoryStore.portfolios.push(p);
    }
    return p;
  },

  savePortfolio: async (portfolioData) => {
    if (getIsConnected()) {
      return await portfolioData.save();
    }
    const idx = memoryStore.portfolios.findIndex(p => p._id.toString() === portfolioData._id.toString());
    if (idx !== -1) {
      memoryStore.portfolios[idx] = { ...portfolioData, updatedAt: new Date() };
    }
    return portfolioData;
  },

  // TRANSACTIONS
  createTransaction: async (data) => {
    if (getIsConnected()) {
      return await Transaction.create(data);
    }
    const tx = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...data,
      timestamp: data.timestamp || new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.transactions.unshift(tx);
    return tx;
  },

  getTransactionsByUserId: async (userId, limit = 50) => {
    const uid = userId.toString();
    if (getIsConnected()) {
      return await Transaction.find({ user: uid }).sort({ timestamp: -1 }).limit(limit);
    }
    return memoryStore.transactions
      .filter(t => t.user.toString() === uid)
      .slice(0, limit);
  },

  getAllTransactions: async (limit = 100) => {
    if (getIsConnected()) {
      return await Transaction.find().populate('user', 'name email').sort({ timestamp: -1 }).limit(limit);
    }
    return memoryStore.transactions.slice(0, limit).map(t => {
      const user = memoryStore.users.find(u => u._id.toString() === t.user.toString());
      return {
        ...t,
        user: user ? { _id: user._id, name: user.name, email: user.email } : null
      };
    });
  },

  updateTransactionStatus: async (id, status) => {
    const idStr = id.toString();
    if (getIsConnected()) {
      return await Transaction.findByIdAndUpdate(idStr, { status }, { new: true });
    }
    const tx = memoryStore.transactions.find(t => t._id.toString() === idStr);
    if (tx) {
      tx.status = status;
      tx.updatedAt = new Date();
    }
    return tx;
  },

  // RAW MEMORY ACCESS FOR SIMULATOR
  getMemoryStocks: () => memoryStore.stocks
};

module.exports = store;
