const express = require('express');
const router = express.Router();
const { addToWishlist, getWishlist } = require('../controllers/wishlistController');
const { protect, roleMiddleware } = require('../middleware/authMiddleware');

router.use(protect);
router.use(roleMiddleware(['factory']));

router.post('/add', addToWishlist);
router.get('/', getWishlist);

module.exports = router;
