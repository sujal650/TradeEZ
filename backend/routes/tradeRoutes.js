const express = require('express');
const router = express.Router();
const { executeTrade, getUserTransactions } = require('../controllers/tradeController');
const { protect } = require('../middleware/auth');

router.post('/execute', protect, executeTrade);
router.get('/history', protect, getUserTransactions);

module.exports = router;
