const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['factory', 'farmer'], required: true },
  location: { type: String, required: true },
  // NOTE: 
  // Geo-location feature temporarily disabled.
  // Will re-enable when frontend sends latitude & longitude.
  /*
  locationCoordinates: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
  },
  */
  phone: { type: String },
  kycStatus: { type: String, enum: ['unverified', 'pending', 'verified'], default: 'unverified' },
  walletBalance: { type: Number, default: 0 },
  // Farmer specific
  rating: { type: Number, default: 0 },
  totalDeliveries: { type: Number, default: 0 },
  wishlistedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of factory IDs
}, { timestamps: true });

userSchema.index({ locationCoordinates: '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
