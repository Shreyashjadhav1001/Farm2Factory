const Order = require('../models/Order');
const Demand = require('../models/Demand');

exports.getFactoryOrders = async (req, res) => {
  try {
    // Populate farmer details
    const orders = await Order.find()
      .populate('demandId')
      .populate('farmerId', 'name email phone')
      .populate('poolId');
    
    // Filter orders belonging to demands created by this factory
    const filteredOrders = orders.filter(order => 
      order.demandId && order.demandId.createdBy.toString() === req.user.id
    );
    
    res.json(filteredOrders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingDetails } = req.body;
    const order = await Order.findById(req.params.id).populate('demandId');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.demandId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (status) order.status = status;
    if (trackingDetails) order.trackingDetails = { ...order.trackingDetails, ...trackingDetails };

    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.joinDemand = async (req, res) => {
  try {
    const { demandId, quantity } = req.body;
    const farmerId = req.user.id;

    // Check if already joined
    const existingOrder = await Order.findOne({ demandId, farmerId });
    if (existingOrder) {
      return res.status(400).json({ message: 'You have already joined this demand' });
    }

    const demand = await Demand.findById(demandId);
    if (!demand) return res.status(404).json({ message: 'Demand not found' });

    if (demand.status !== 'OPEN') {
      return res.status(400).json({ message: 'Demand is not open for new participants' });
    }

    // Check if quantity is within limits
    if (Number(quantity) < demand.minQuantityPerFarmer) {
      return res.status(400).json({ message: `Minimum quantity required is ${demand.minQuantityPerFarmer} Tons` });
    }

    const order = new Order({
      demandId,
      farmerId,
      quantity: Number(quantity),
      status: 'PENDING'
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getParticipants = async (req, res) => {
  try {
    const { demandId } = req.params;
    const orders = await Order.find({ demandId })
      .populate('farmerId', 'name location phone rating totalDeliveries');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateParticipantStatus = async (req, res) => {
  try {
    const { status } = req.body; // ACCEPTED or REJECTED
    const order = await Order.findById(req.params.id).populate('demandId');

    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.demandId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Update demand fulfilledQuantity if status changed to/from ACCEPTED
    if (status === 'ACCEPTED' && oldStatus !== 'ACCEPTED') {
      await Demand.findByIdAndUpdate(order.demandId._id, { $inc: { fulfilledQuantity: order.quantity } });
    } else if (status !== 'ACCEPTED' && oldStatus === 'ACCEPTED') {
       await Demand.findByIdAndUpdate(order.demandId._id, { $inc: { fulfilledQuantity: -order.quantity } });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
