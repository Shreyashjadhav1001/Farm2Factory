const express = require('express');
const router = express.Router();
const { 
  getFactoryOrders, 
  updateOrderStatus, 
  joinDemand, 
  getParticipants, 
  updateParticipantStatus,
  createFromDemand,
  dispatchOrder,
  deliverOrder,
  payOrder
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
router.post('/create-from-demand/:demandId', roleMiddleware(['factory']), createFromDemand);
router.post('/dispatch/:id', roleMiddleware(['factory']), dispatchOrder);
router.post('/deliver/:id', roleMiddleware(['factory']), deliverOrder);
router.post('/pay/:id', roleMiddleware(['factory']), payOrder);

module.exports = router;
