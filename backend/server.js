const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const { connectDB, getIsConnected } = require('./config/db');
const store = require('./services/store');
const { startSimulator } = require('./services/marketSimulator');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const stockRoutes = require('./routes/stockRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger for monitoring & diagnostics
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    appName: 'TradeEZ / StockEZ API',
    version: '1.0.0',
    database: getIsConnected() ? 'MongoDB (Connected)' : 'In-Memory High-Speed Store (Active)',
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Attempt MongoDB connection
    await connectDB();

    // Initialize Store (loads seed data if empty or in memory)
    await store.init();

    // Start background market simulation engine
    startSimulator(4000);

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 TradeEZ Backend Server running on port ${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`💾 Database:   ${getIsConnected() ? 'MongoDB' : 'In-Memory Store (Auto-fallback)'}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();

module.exports = app;
