const Demand = require('../models/Demand');

exports.createDemand = async (req, res) => {
  try {
    console.log("===== CREATE DEMAND START =====");
    console.log("REQUEST BODY:", req.body);
    console.log("REQUEST USER:", req.user);

    let { title, ratePerTon, totalQuantityRequired, minQuantityPerFarmer, startDate, endDate, location, transportResponsibility, demandType, locationCoordinates } = req.body;

    // Default to Sangli coordinates if not provided or [0,0]
    if (!locationCoordinates || !locationCoordinates.coordinates || 
        (locationCoordinates.coordinates[0] === 0 && locationCoordinates.coordinates[1] === 0)) {
      locationCoordinates = {
        type: 'Point',
        coordinates: [74.5815, 16.8524]
      };
    }

    const demand = new Demand({
      title,
      ratePerTon: Number(ratePerTon),
      totalQuantityRequired: Number(totalQuantityRequired),
      minQuantityPerFarmer: Number(minQuantityPerFarmer),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      location,
      transportResponsibility,
      demandType,
      locationCoordinates,
      createdBy: req.user.id,
      status: 'OPEN',
      fulfilledQuantity: 0
    });
    
    await demand.save();
    console.log("DEMAND CREATED SUCCESSFULLY");
    res.status(201).json(demand);
  } catch (error) {
    console.error("CREATE DEMAND ERROR:", error);
    console.error("STACK:", error.stack);
    res.status(500).json({ message: error.message });
  }
};

exports.getFactoryDemands = async (req, res) => {
  try {
    const demands = await Demand.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(demands);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteDemand = async (req, res) => {
  try {
    const demand = await Demand.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!demand) return res.status(404).json({ message: 'Demand not found' });
    res.json({ message: 'Demand deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.lockDemand = async (req, res) => {
  try {
    const demandId = req.params.id;
    const demand = await Demand.findOneAndUpdate(
      { _id: demandId, createdBy: req.user.id },
      { status: 'LOCKED' },
      { new: true }
    );
    
    if (!demand) return res.status(404).json({ message: 'Demand not found' });

    // When demand is locked, all accepted participations move to PROCESSING (Supply Chain started)
    const Order = require('../models/Order');
    await Order.updateMany(
      { demandId: demandId, status: 'ACCEPTED' },
      { status: 'PROCESSING' }
    );

    res.json(demand);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateDemand = async (req, res) => {
  try {
    const { title, ratePerTon, totalQuantityRequired, minQuantityPerFarmer, startDate, endDate, location, transportResponsibility, demandType, locationCoordinates } = req.body;
    
    const demand = await Demand.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!demand) {
      return res.status(404).json({ message: 'Demand not found or not authorized' });
    }
    
    if (demand.status !== 'OPEN') {
      return res.status(400).json({ message: 'Cannot edit a locked or completed demand' });
    }

    const updatedDemand = await Demand.findByIdAndUpdate(
      req.params.id,
      {
        title,
        ratePerTon: Number(ratePerTon),
        totalQuantityRequired: Number(totalQuantityRequired),
        minQuantityPerFarmer: Number(minQuantityPerFarmer),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location,
        transportResponsibility,
        demandType,
        locationCoordinates
      },
      { new: true }
    );

    res.json(updatedDemand);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllDemands = async (req, res) => {
  try {
    const demands = await Demand.find({ status: 'OPEN' })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(demands);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
