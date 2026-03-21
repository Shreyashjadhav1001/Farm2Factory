const express = require('express');
const router = express.Router();
const { 
  getFactoryOrders, 
  updateOrderStatus, 
  joinDemand, 
  getParticipants, 
  updateParticipantStatus 
} = require('../controllers/orderController');
const { protect, roleMiddleware } = require('../middleware/authMiddleware');

router.use(protect);

// Farmer routes
router.post('/join-demand', roleMiddleware(['farmer']), joinDemand);

// Factory routes
router.get('/factory-orders', roleMiddleware(['factory']), getFactoryOrders);
router.patch('/update-status/:id', roleMiddleware(['factory']), updateOrderStatus);
router.get('/participants/:demandId', roleMiddleware(['factory']), getParticipants);
router.patch('/update-participant-status/:id', roleMiddleware(['factory']), updateParticipantStatus);

module.exports = router;
