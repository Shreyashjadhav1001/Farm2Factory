const User = require('../models/User');

exports.rateFarmer = async (req, res) => {
  try {
    const { farmerId, score, quality, deliveryTiming, communication } = req.body;
    const farmer = await User.findById(farmerId);
    if (!farmer || farmer.role !== 'farmer') return res.status(404).json({ message: 'Farmer not found' });

    // Update farmer average rating
    const currentRating = farmer.rating || 0;
    const totalDeliveries = farmer.totalDeliveries || 0;
    const newRating = ((currentRating * totalDeliveries) + score) / (totalDeliveries + 1);

    farmer.rating = newRating;
    farmer.totalDeliveries += 1;
    await farmer.save();

    res.json({ message: 'Rating saved successfully', newRating });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
