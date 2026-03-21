const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  description: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
