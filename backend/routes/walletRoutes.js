const express = require('express');
const router = express.Router();
const { getWalletBalance, withdrawMoney, addMoney, getTransactions } = require('../controllers/walletController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/balance', getWalletBalance);
router.post('/withdraw', withdrawMoney);
router.post('/add', addMoney);
router.get('/transactions', getTransactions);

module.exports = router;
