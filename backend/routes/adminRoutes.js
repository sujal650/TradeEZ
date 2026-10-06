const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUser,
  createStock,
  updateStock,
  deleteStock,
  getAllTransactions,
  moderateTransaction
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/auth');

// All admin routes require valid token + ADMIN role
router.use(protect, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:id', updateUser);
router.post('/stocks', createStock);
router.patch('/stocks/:id', updateStock);
router.delete('/stocks/:id', deleteStock);
router.get('/transactions', getAllTransactions);
router.patch('/transactions/:id/moderate', moderateTransaction);

module.exports = router;
