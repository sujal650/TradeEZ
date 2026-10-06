const express = require('express');
const router = express.Router();
const {
  getAllStocks,
  getFeaturedStocks,
  getStockBySymbol,
  getMarketOverview
} = require('../controllers/stockController');

router.get('/', getAllStocks);
router.get('/featured', getFeaturedStocks);
router.get('/market/overview', getMarketOverview);
router.get('/:symbol', getStockBySymbol);

module.exports = router;
