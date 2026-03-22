const express = require('express');
const router = express.Router();
const { 
  getNearbyDemands, 
  submitKYC, 
  joinDemand, 
  createPool, 
  updateDispatch,
  getFarmerDashboard,
  getFarmProfile,
  updateFarmProfile,
  uploadCropImage,
  generateAgreement,
  updateContribution,
  deleteContribution
} = require('../controllers/farmerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All farmer routes are protected

router.get('/dashboard', getFarmerDashboard);
router.post('/kyc', submitKYC);
router.get('/nearby-demands', getNearbyDemands);
router.post('/join-demand', joinDemand);
router.post('/create-pool', createPool);
router.post('/dispatch-update', updateDispatch);
router.get('/farm-profile', getFarmProfile);
router.put('/update-profile', updateFarmProfile);
router.post('/upload-crop-image', uploadCropImage);
router.get('/agreement/:orderId', generateAgreement);
router.put('/contribution/update/:id', updateContribution);
router.delete('/contribution/:id', deleteContribution);

module.exports = router;
