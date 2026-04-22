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

    const demand = await Demand.findById(order.demandId._id);
    if (demand) {
      if (status === 'REJECTED' && oldStatus !== 'REJECTED') {
        // Revert contribution if it was previously counted (PENDING or ACCEPTED)
        demand.fulfilledQuantity = Math.max(0, (demand.fulfilledQuantity || 0) - order.quantity);
        demand.status = 'OPEN';
        await demand.save();
      } else if (status === 'ACCEPTED' && oldStatus !== 'ACCEPTED') {
        if (oldStatus === 'REJECTED') {
          demand.fulfilledQuantity = (demand.fulfilledQuantity || 0) + order.quantity;
          if (demand.fulfilledQuantity >= demand.totalQuantityRequired) {
            demand.status = 'COMPLETED';
          }
          await demand.save();
        }
      } else if (status === 'PENDING' && oldStatus === 'REJECTED') {
        demand.fulfilledQuantity = (demand.fulfilledQuantity || 0) + order.quantity;
        await demand.save();
      }
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createFromDemand = async (req, res) => {
  try {
    const { demandId } = req.params;
    const demand = await Demand.findById(demandId);
    if (!demand) return res.status(404).json({ message: 'Demand not found' });
    if (demand.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Update all orders for this demand to ACCEPTED to formally "create" them from the locked demand.
    // Also consider PENDING -> ACCEPTED.
    await Order.updateMany(
      { demandId, status: { $in: ['PENDING', 'ACCEPTED', 'PROCESSING'] } },
      { status: 'ACCEPTED' }
    );
    
    const orders = await Order.find({ demandId });
    res.json({ message: 'Orders created/accepted successfully', orders });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.dispatchOrder = async (req, res) => {
  try {
    const { driverName, vehicleNumber, driverPhone, expectedDelivery } = req.body;
    const order = await Order.findById(req.params.id).populate('demandId');
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.demandId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    order.status = 'DISPATCHED';
    order.dispatchDetails = { 
       driverName, 
       vehicleNumber, 
       driverPhone, 
       expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : new Date(Date.now() + 86400000) 
    };
    
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deliverOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('demandId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.demandId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    order.status = 'DELIVERED';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');

exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('demandId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.demandId.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }
    
    order.paymentStatus = 'Paid';
    await order.save();
    
    const amount = order.quantity * order.demandId.ratePerTon;
    let wallet = await Wallet.findOne({ userId: order.farmerId });
    if (!wallet) {
      wallet = new Wallet({ userId: order.farmerId, balance: 0 });
    }
    wallet.balance += amount;
    await wallet.save();
    
    const transaction = new Transaction({
      walletId: wallet._id,
      userId: order.farmerId,
      amount: amount,
      type: 'credit',
      description: `Payment for Order (Demand: ${order.demandId.title})`,
      status: 'completed'
    });
    await transaction.save();
    
    res.json({ message: 'Payment successful', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
