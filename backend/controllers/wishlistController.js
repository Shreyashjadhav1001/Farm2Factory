const User = require('../models/User');

exports.addToWishlist = async (req, res) => {
  try {
    const { farmerId } = req.body;
    const farmer = await User.findById(farmerId);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    if (!farmer.wishlistedBy.includes(req.user.id)) {
      farmer.wishlistedBy.push(req.user.id);
      await farmer.save();
    }
    res.json({ message: 'Farmer added to wishlist' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await User.find({ wishlistedBy: req.user.id });
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
