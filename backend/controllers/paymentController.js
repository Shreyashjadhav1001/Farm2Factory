const QRCode = require('qrcode');
const Order = require('../models/Order');

exports.getPaymentQR = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Dummy payment data
    const paymentData = {
      orderId: order._id,
      amount: order.paymentDetails.preOrderAmount + order.paymentDetails.postDeliveryAmount,
      currency: 'INR',
      merchant: 'Farm2Factory'
    };

    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(paymentData));
    res.json({ qrCode: qrCodeDataUrl, amount: paymentData.amount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, { paymentStatus: 'Paid' }, { new: true });
    res.json({ message: 'Payment confirmed', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
