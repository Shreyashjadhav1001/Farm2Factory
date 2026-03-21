const mongoose = require('mongoose');

const poolSchema = new mongoose.Schema({
  demandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Demand', required: true },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmersJoined: [{
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantityCommitted: { type: Number, required: true }
  }],
  totalQuantityCommitted: { type: Number, default: 0 },
  status: { type: String, enum: ['OPEN', 'LOCKED', 'ACCEPTED', 'CANCELLED'], default: 'OPEN' },
}, { timestamps: true });

module.exports = mongoose.model('Pool', poolSchema);
