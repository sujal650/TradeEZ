const mongoose = require('mongoose');

const historicalPointSchema = new mongoose.Schema(
  {
    timestamp: {
      type: Date,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    volume: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const stockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Stock name is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Stock price is required'],
      min: [0, 'Price cannot be negative']
    },
    previousClose: {
      type: Number,
      default: 0
    },
    change: {
      type: Number,
      default: 0
    },
    changePercent: {
      type: Number,
      default: 0
    },
    open: {
      type: Number,
      default: 0
    },
    high: {
      type: Number,
      default: 0
    },
    low: {
      type: Number,
      default: 0
    },
    volume: {
      type: Number,
      default: 0
    },
    marketCap: {
      type: Number,
      default: 0
    },
    sector: {
      type: String,
      default: 'Technology'
    },
    description: {
      type: String,
      default: ''
    },
    dailyStats: {
      open: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      volume: { type: Number, default: 0 },
      week52High: { type: Number, default: 0 },
      week52Low: { type: Number, default: 0 },
      peRatio: { type: Number, default: 0 },
      dividendYield: { type: Number, default: 0 }
    },
    historicalData: [historicalPointSchema],
    isFeatured: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: ['active', 'halted'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Stock', stockSchema);
