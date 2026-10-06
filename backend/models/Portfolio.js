const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
  {
    stock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true
    },
    stockName: {
      type: String,
      default: ''
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative']
    },
    averageBuyPrice: {
      type: Number,
      required: true,
      min: [0, 'Average price cannot be negative']
    },
    totalInvested: {
      type: Number,
      required: true,
      min: [0, 'Total invested cannot be negative']
    }
  },
  { _id: false }
);

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    holdings: [holdingSchema],
    totalPortfolioValue: {
      type: Number,
      default: 0
    },
    totalInvested: {
      type: Number,
      default: 0
    },
    totalProfitLoss: {
      type: Number,
      default: 0
    },
    totalProfitLossPercent: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
