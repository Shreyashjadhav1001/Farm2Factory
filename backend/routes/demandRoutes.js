const express = require('express');
const router = express.Router();
const { createDemand, getFactoryDemands, deleteDemand, lockDemand, updateDemand } = require('../controllers/demandController');
const { protect, roleMiddleware } = require('../middleware/authMiddleware');

router.use(protect);
router.use(roleMiddleware(['factory']));

router.post('/create-demand', createDemand);
router.get('/factory-demands', getFactoryDemands);
router.delete('/delete-demand/:id', deleteDemand);
router.patch('/lock-demand/:id', lockDemand);
router.put('/update-demand/:id', updateDemand);

module.exports = router;
