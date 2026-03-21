const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  demandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Demand', required: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Can be one farmer or representative of pool
  poolId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pool' },
  quantity: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'ARRIVED', 'DELIVERED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  dispatchDetails: {
    driverName: { type: String },
    driverPhone: { type: String },
    vehicleNumber: { type: String },
    expectedDelivery: { type: Date }
  },
  agreementGenerated: { type: Boolean, default: false },
  agreementUrl: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paymentDetails: {
    preOrderAmount: { type: Number },
    postDeliveryAmount: { type: Number },
    qrCode: { type: String } // Base64 or URL
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
