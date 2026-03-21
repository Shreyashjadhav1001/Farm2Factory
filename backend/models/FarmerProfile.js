const mongoose = require('mongoose');

const farmerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, required: true },
  aadharNumber: { type: String, required: true },
  bankAccountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  farmLocation: { type: String, required: true },
  farmSize: { type: Number, required: true }, // In acres
  sugarcaneVariety: { type: String },
  expectedHarvestMonth: { type: String },
  estimatedYield: { type: Number }, // In tons
  images: [{ type: String }], // URLs for crop/harvest images
}, { timestamps: true });

module.exports = mongoose.model('FarmerProfile', farmerProfileSchema);
