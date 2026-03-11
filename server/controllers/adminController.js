const User = require('../models/User');
const PG = require('../models/PG');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const SearchLog = require('../models/SearchLog');
const Enquiry = require('../models/Enquiry');

// @desc  Admin dashboard stats
const getDashboard = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [totalPGs, activePGs, pendingPGs, totalOwners, activeOwners, totalTenants, totalRooms, occupiedRooms, totalSearches, totalEnquiries, recentSearches] = await Promise.all([
      PG.countDocuments(),
      PG.countDocuments({ status: 'active' }),
      PG.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: 'owner' }),
      User.countDocuments({ role: 'owner', isActive: true }),
      Tenant.countDocuments({ status: 'active' }),
      Room.countDocuments(),
      Room.countDocuments({ status: 'occupied' }),
      SearchLog.countDocuments({ type: 'search' }),
      Enquiry.countDocuments(),
      SearchLog.countDocuments({ type: 'search', createdAt: { $gte: new Date(year, month - 1, 1) } }),
    ]);

    // City-wise PG distribution
    const cityDistribution = await PG.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$address.city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 10 }
    ]);

    // Monthly PG growth (last 6 months)
    const pgGrowth = await PG.aggregate([
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': -1, '_id.month': -1 } }, { $limit: 6 }
    ]);

    // Top searched cities
    const topSearchedCities = await SearchLog.aggregate([
      { $match: { type: 'search', city: { $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 5 }
    ]);

    res.json({
      success: true,
      dashboard: {
        totalPGs, activePGs, pendingPGs,
        totalOwners, activeOwners,
        totalTenants, totalRooms, occupiedRooms,
        totalSearches, recentSearches, totalEnquiries,
        occupancyRate: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
        cityDistribution, pgGrowth, topSearchedCities,
      },
    });
  } catch (error) { next(error); }
};

// @desc  Get all PGs (admin)
const getAllPGs = async (req, res, next) => {
  try {
    const { status, city, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [pgs, total] = await Promise.all([
      PG.find(query).populate('owner', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      PG.countDocuments(query),
    ]);
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), pgs });
  } catch (error) { next(error); }
};

// @desc  Approve or reject a PG
const updatePGStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['active', 'rejected', 'inactive'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const pg = await PG.findByIdAndUpdate(req.params.id, { status, rejectionReason: rejectionReason || '' }, { new: true }).populate('owner', 'name email');
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });
    res.json({ success: true, pg });
  } catch (error) { next(error); }
};

// @desc  Delete a PG (admin force)
const deletePG = async (req, res, next) => {
  try {
    await PG.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'PG deleted' });
  } catch (error) { next(error); }
};

// @desc  Get all owners
const getAllOwners = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { role: 'owner' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const skip = (Number(page) - 1) * Number(limit);
    const [owners, total] = await Promise.all([
      User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);
    // Add PG count
    const ownersWithStats = await Promise.all(owners.map(async (o) => {
      const pgCount = await PG.countDocuments({ owner: o._id });
      const tenantCount = await Tenant.countDocuments({ owner: o._id, status: 'active' });
      return { ...o.toObject(), pgCount, tenantCount };
    }));
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), owners: ownersWithStats });
  } catch (error) { next(error); }
};

// @desc  Toggle owner active status
const toggleOwnerStatus = async (req, res, next) => {
  try {
    const owner = await User.findById(req.params.id);
    if (!owner || owner.role === 'admin') return res.status(404).json({ success: false, message: 'Owner not found' });
    owner.isActive = !owner.isActive;
    await owner.save();
    res.json({ success: true, message: `Owner ${owner.isActive ? 'activated' : 'deactivated'}`, owner: { id: owner._id, isActive: owner.isActive } });
  } catch (error) { next(error); }
};

// @desc  Get all tenants (admin)
const getAllTenants = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const skip = (Number(page) - 1) * Number(limit);
    const [tenants, total] = await Promise.all([
      Tenant.find(query).populate('pg', 'name address').populate('room', 'roomNumber').populate('owner', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Tenant.countDocuments(query),
    ]);
    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), tenants });
  } catch (error) { next(error); }
};

// @desc  Analytics data
const getAnalytics = async (req, res, next) => {
  try {
    const [dailySearches, topPGViews, topCities, conversionRate] = await Promise.all([
      SearchLog.aggregate([
        { $match: { type: 'search', createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      SearchLog.aggregate([
        { $match: { type: 'view', pgId: { $ne: null } } },
        { $group: { _id: '$pgId', views: { $sum: 1 } } },
        { $sort: { views: -1 } }, { $limit: 10 },
        { $lookup: { from: 'pgs', localField: '_id', foreignField: '_id', as: 'pg' } },
        { $unwind: '$pg' },
        { $project: { pgName: '$pg.name', city: '$pg.address.city', views: 1 } }
      ]),
      SearchLog.aggregate([
        { $match: { type: 'search', city: { $ne: '' } } },
        { $group: { _id: '$city', searches: { $sum: 1 } } },
        { $sort: { searches: -1 } }, { $limit: 10 }
      ]),
      SearchLog.aggregate([
        { $facet: { searches: [{ $match: { type: 'search' } }, { $count: 'count' }], views: [{ $match: { type: 'view' } }, { $count: 'count' }] } }
      ]),
    ]);
    res.json({ success: true, analytics: { dailySearches, topPGViews, topCities } });
  } catch (error) { next(error); }
};

// @desc  Get all enquiries (admin)
const getAllEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().populate('pg', 'name').populate('owner', 'name').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, enquiries });
  } catch (error) { next(error); }
};

module.exports = { getDashboard, getAllPGs, updatePGStatus, deletePG, getAllOwners, toggleOwnerStatus, getAllTenants, getAnalytics, getAllEnquiries };
