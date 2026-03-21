const mongoose = require('mongoose');

const demandSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ratePerTon: { type: Number, required: true },
  totalQuantityRequired: { type: Number, required: true },
  minQuantityPerFarmer: { type: Number, required: true },
  fulfilledQuantity: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, required: true },
  locationCoordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  },
  transportResponsibility: { type: String, enum: ['Factory', 'Farmer'], required: true },
  demandType: { type: String, enum: ['Individual', 'Pool', 'Hybrid'], required: true },
  status: { type: String, enum: ['OPEN', 'LOCKED', 'COMPLETED', 'CANCELLED'], default: 'OPEN' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

demandSchema.index({ locationCoordinates: '2dsphere' });

module.exports = mongoose.model('Demand', demandSchema);
