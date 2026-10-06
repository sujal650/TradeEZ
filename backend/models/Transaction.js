const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
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
    type: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be non-negative']
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING_APPROVAL', 'REJECTED'],
      default: 'COMPLETED',
      index: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
