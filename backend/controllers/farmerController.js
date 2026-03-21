const Demand = require('../models/Demand');
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Pool = require('../models/Pool');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

// @desc    Get nearby factory demands within 100km
// @route   GET /api/farmer/nearby-demands
exports.getNearbyDemands = async (req, res) => {
  const { lng, lat } = req.query;
  if (!lng || !lat) return res.status(400).json({ message: 'Longitude and Latitude are required' });

  try {
    const demands = await Demand.find({
      locationCoordinates: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 100000 // 100km in meters
        }
      },
      status: 'OPEN'
    }).populate('createdBy', 'name');

    res.json(demands);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Submit KYC details
// @route   POST /api/farmer/kyc
exports.submitKYC = async (req, res) => {
  const { fullName, aadharNumber, bankAccountNumber, ifscCode, farmLocation, farmSize } = req.body;
  try {
    let profile = await FarmerProfile.findOne({ userId: req.user.id });
    if (profile) return res.status(400).json({ message: 'KYC already submitted' });

    profile = new FarmerProfile({
      userId: req.user.id,
      fullName,
      aadharNumber,
      bankAccountNumber,
      ifscCode,
      farmLocation,
      farmSize
    });
    await profile.save();

    await User.findByIdAndUpdate(req.user.id, { kycStatus: 'pending' });

    res.status(201).json({ message: 'KYC submitted successfully', profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Join a demand (Individual or Pool)
// @route   POST /api/farmer/join-demand
exports.joinDemand = async (req, res) => {
  const { demandId, quantity, type, poolId } = req.body;
  try {
    const demand = await Demand.findById(demandId);
    if (!demand) return res.status(404).json({ message: 'Demand not found' });

    if (type === 'Individual') {
      const order = new Order({
        demandId,
        farmerId: req.user.id,
        factoryId: demand.createdBy,
        quantity,
        status: 'PENDING'
      });
      await order.save();
      return res.status(201).json({ message: 'Joined demand individually', order });
    } else if (type === 'Pool') {
      const pool = await Pool.findById(poolId);
      if (!pool) return res.status(404).json({ message: 'Pool not found' });

      pool.farmersJoined.push({ farmerId: req.user.id, quantityCommitted: quantity });
      pool.totalQuantityCommitted += quantity;
      await pool.save();
      return res.json({ message: 'Joined pool successfully', pool });
    }
    res.status(400).json({ message: 'Invalid contribution type' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Create a new community pool
// @route   POST /api/farmer/create-pool
exports.createPool = async (req, res) => {
  const { demandId, quantity } = req.body;
  try {
    const pool = new Pool({
      demandId,
      creatorId: req.user.id,
      farmersJoined: [{ farmerId: req.user.id, quantityCommitted: quantity }],
      totalQuantityCommitted: quantity
    });
    await pool.save();
    res.status(201).json({ message: 'Pool created successfully', pool });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Update order dispatch details
// @route   POST /api/farmer/dispatch-update
exports.updateDispatch = async (req, res) => {
  const { orderId, driverName, driverPhone, vehicleNumber, expectedDelivery } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.dispatchDetails = { driverName, driverPhone, vehicleNumber, expectedDelivery };
    order.status = 'DISPATCHED';
    await order.save();

    res.json({ message: 'Dispatch details updated', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get Farmer Dashboard Data
// @route   GET /api/farmer/dashboard
exports.getFarmerDashboard = async (req, res) => {
  try {
    const orders = await Order.find({ farmerId: req.user.id }).populate('demandId');
    const user = await User.findById(req.user.id);
    const pools = await Pool.find({ 'farmersJoined.farmerId': req.user.id }).populate('demandId');
    
    res.json({ orders, kycStatus: user.kycStatus, walletBalance: user.walletBalance, pools });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Get Farm Profile
// @route   GET /api/farmer/farm-profile
exports.getFarmProfile = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOne({ userId: req.user.id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Update Farm Profile
// @route   PUT /api/farmer/update-profile
exports.updateFarmProfile = async (req, res) => {
  try {
    const profile = await FarmerProfile.findOneAndUpdate(
      { userId: req.user.id },
      { $set: req.body },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// @desc    Upload Crop Image
// @route   POST /api/farmer/upload-crop-image
exports.uploadCropImage = async (req, res) => {
  const { imageUrl } = req.body; // In real app, use multer to upload to S3/Cloudinary
  try {
    const profile = await FarmerProfile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    profile.images.push(imageUrl);
    await profile.save();
    res.json({ message: 'Image uploaded successfully', profile });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
const { jsPDF } = require('jspdf');

// @desc    Generate trade agreement PDF
// @route   GET /api/farmer/agreement/:orderId
exports.generateAgreement = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('demandId')
      .populate('farmerId', 'name phone')
      .populate('factoryId', 'name location');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text('FARM2FACTORY TRADE AGREEMENT', 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Document ID: AG-REC-${order._id}`, 20, 40);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);

    // Section 1: Parties
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('1. PARTIES INVOLVED', 20, 60);
    doc.setLineWidth(0.5);
    doc.line(20, 62, 190, 62);
    
    doc.setFontSize(11);
    doc.text(`FARMER (SELLER): ${order.farmerId.name}`, 25, 75);
    doc.text(`FACTORY (BUYER): ${order.factoryId.name}`, 25, 82);
    doc.text(`LOCATION: ${order.factoryId.location}`, 25, 89);

    // Section 2: Commodity & Trade Terms
    doc.setFontSize(14);
    doc.text('2. COMMODITY & TRADE TERMS', 20, 110);
    doc.line(20, 112, 190, 112);
    
    doc.setFontSize(11);
    doc.text(`COMMODITY: Sugarcane (Saccharum officinarum)`, 25, 125);
    doc.text(`TOTAL QUANTITY: ${order.quantity} Metric Tons`, 25, 132);
    doc.text(`AGREED RATE: INR ${order.demandId.ratePerTon} / Metric Ton`, 25, 139);
    doc.text(`ESTIMATED TOTAL VALUE: INR ${(order.quantity * order.demandId.ratePerTon).toLocaleString()}`, 25, 146);

    // Section 3: Legal Declarations
    doc.setFontSize(14);
    doc.text('3. LEGAL DECLARATIONS', 20, 165);
    doc.line(20, 167, 190, 167);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    const terms = [
      "I. The Seller agrees to supply the specified quantity in good quality as per factory standards.",
      "II. The Buyer agrees to accept the harvest and process payment into the Seller's digital wallet.",
      "III. Any disputes shall be resolved through the Farm2Factory Arbitration Council.",
      "IV. This document serves as a binding digital contract once 'Locked' by both parties."
    ];
    terms.forEach((term, i) => doc.text(term, 25, 178 + (i * 7)));

    // Footer Signatures
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text('Digital Signature (Seller)', 25, 230);
    doc.text('Digital Signature (Buyer)', 130, 230);
    
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text('This is a computer-generated document and does not require physical signatures.', 60, 280);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Agreement_${order._id}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    res.status(500).json({ message: 'Error generating agreement', error: err.message });
  }
};
