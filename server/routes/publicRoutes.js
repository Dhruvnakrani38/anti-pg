const express = require('express');
const router = express.Router();
const { searchPGs, getPGDetail, getCities, getFeaturedPGs, submitEnquiry, getPlatformStats } = require('../controllers/publicController');

router.get('/pgs', searchPGs);
router.get('/pgs/:id', getPGDetail);
router.get('/cities', getCities);
router.get('/featured', getFeaturedPGs);
router.get('/stats', getPlatformStats);
router.post('/enquiry', submitEnquiry);

module.exports = router;
