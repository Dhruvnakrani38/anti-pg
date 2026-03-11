const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getDashboard, getAllPGs, updatePGStatus, deletePG, getAllOwners, toggleOwnerStatus, getAllTenants, getAnalytics, getAllEnquiries } = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/pgs', getAllPGs);
router.put('/pgs/:id/status', updatePGStatus);
router.delete('/pgs/:id', deletePG);
router.get('/owners', getAllOwners);
router.patch('/owners/:id/toggle', toggleOwnerStatus);
router.get('/tenants', getAllTenants);
router.get('/analytics', getAnalytics);
router.get('/enquiries', getAllEnquiries);

module.exports = router;
