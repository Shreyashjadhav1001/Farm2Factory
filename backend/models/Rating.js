const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  factoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  cropQuality: { type: Number, min: 1, max: 5, required: true },
  deliveryTime: { type: Number, min: 1, max: 5, required: true },
  communication: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
