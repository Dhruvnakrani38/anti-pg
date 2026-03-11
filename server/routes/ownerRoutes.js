const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  getDashboard, getMyPGs, addPG, updatePG, deletePG, togglePGStatus,
  getRooms, addRoom, updateRoom, deleteRoom,
  getTenants, addTenant, updateTenant, checkoutTenant,
  getFinanceSummary, getPayments, addPayment, updatePayment,
  getExpenses, addExpense, getEnquiries, markEnquiryRead,
} = require('../controllers/ownerController');

// All owner routes require auth + owner role
router.use(protect, authorize('owner'));

// Dashboard
router.get('/dashboard', getDashboard);

// PG Management
router.get('/pgs', getMyPGs);
router.post('/pgs', upload.array('images', 10), addPG);
router.put('/pgs/:id', upload.array('images', 10), updatePG);
router.delete('/pgs/:id', deletePG);
router.patch('/pgs/:id/toggle', togglePGStatus);

// Room Management
router.get('/pgs/:pgId/rooms', getRooms);
router.post('/pgs/:pgId/rooms', addRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// Tenant Management
router.get('/tenants', getTenants);
router.post('/tenants', upload.single('idProof'), addTenant);
router.put('/tenants/:id', updateTenant);
router.patch('/tenants/:id/checkout', checkoutTenant);

// Finance
router.get('/finance/summary', getFinanceSummary);
router.get('/payments', getPayments);
router.post('/payments', addPayment);
router.put('/payments/:id', updatePayment);
router.get('/expenses', getExpenses);
router.post('/expenses', addExpense);

// Enquiries
router.get('/enquiries', getEnquiries);
router.patch('/enquiries/:id/read', markEnquiryRead);

module.exports = router;
