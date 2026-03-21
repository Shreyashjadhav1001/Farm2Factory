const express = require('express');
const router = express.Router();
const { getPaymentQR, confirmPayment } = require('../controllers/paymentController');
const { protect, roleMiddleware } = require('../middleware/authMiddleware');

router.use(protect);
router.use(roleMiddleware(['factory']));

router.get('/qr/:id', getPaymentQR);
router.post('/confirm-payment/:id', confirmPayment);

module.exports = router;
