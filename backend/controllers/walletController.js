const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get wallet balance
// @route   GET /api/wallet/balance
exports.getWalletBalance = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id });
      await wallet.save();
    }
    res.json({ balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Withdraw money from wallet
// @route   POST /api/wallet/withdraw
exports.withdrawMoney = async (req, res) => {
  const { amount } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (user.kycStatus !== 'verified') {
      return res.status(403).json({ message: 'KYC must be verified to withdraw money' });
    }

    const wallet = await Wallet.findOne({ userId: req.user.id });
    if (wallet.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    wallet.balance -= amount;
    await wallet.save();

    const transaction = new Transaction({
      walletId: wallet._id,
      userId: req.user.id,
      amount,
      type: 'debit',
      description: 'Withdrawal to bank account'
    });
    await transaction.save();

    await User.findByIdAndUpdate(req.user.id, { $inc: { walletBalance: -amount } });

    res.json({ message: 'Withdrawal successful', balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Add money to wallet
// @route   POST /api/wallet/add
exports.addMoney = async (req, res) => {
  const { amount } = req.body;
  try {
    let wallet = await Wallet.findOne({ userId: req.user.id });
    if (!wallet) {
      wallet = new Wallet({ userId: req.user.id });
    }

    wallet.balance += amount;
    await wallet.save();

    const transaction = new Transaction({
      walletId: wallet._id,
      userId: req.user.id,
      amount,
      type: 'credit',
      description: 'Added money to wallet'
    });
    await transaction.save();

    await User.findByIdAndUpdate(req.user.id, { $inc: { walletBalance: amount } });

    res.json({ message: 'Money added successfully', balance: wallet.balance });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get transaction history
// @route   GET /api/wallet/transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
