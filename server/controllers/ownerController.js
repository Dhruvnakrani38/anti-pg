const PG = require('../models/PG');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');
const Payment = require('../models/Payment');
const Expense = require('../models/Expense');
const Enquiry = require('../models/Enquiry');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Helper: upload buffer to cloudinary
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err); else resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

// ==================== DASHBOARD ====================
const getDashboard = async (req, res, next) => {
  try {
    const ownerId = req.user._id;
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [totalRooms, occupiedRooms, tenants, pgs, payments, pendingPayments, enquiries] = await Promise.all([
      Room.countDocuments({ owner: ownerId }),
      Room.countDocuments({ owner: ownerId, status: 'occupied' }),
      Tenant.countDocuments({ owner: ownerId, status: 'active' }),
      PG.find({ owner: ownerId }).select('name status').lean(),
      Payment.find({ owner: ownerId, month, year, status: 'paid' }),
      Payment.countDocuments({ owner: ownerId, month, year, status: 'pending' }),
      Enquiry.countDocuments({ owner: ownerId, isRead: false }),
    ]);

    const monthlyRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      dashboard: {
        totalRooms,
        occupiedRooms,
        vacantRooms: totalRooms - occupiedRooms,
        totalTenants: tenants,
        totalPGs: pgs.length,
        activePGs: pgs.filter(p => p.status === 'active').length,
        monthlyRevenue,
        pendingPayments,
        unreadEnquiries: enquiries,
      },
    });
  } catch (error) { next(error); }
};

// ==================== PG MANAGEMENT ====================
const getMyPGs = async (req, res, next) => {
  try {
    const pgs = await PG.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, pgs });
  } catch (error) { next(error); }
};

const addPG = async (req, res, next) => {
  try {
    const { name, description, category, street, locality, city, pincode, state, amenities, houseRules, contactPhone, startingRent } = req.body;

    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'pg-management/pgs'));
      const results = await Promise.all(uploadPromises);
      images = results.map(r => r.secure_url);
    }

    const pg = await PG.create({
      owner: req.user._id,
      name, description, category,
      address: { street, locality, city, pincode, state },
      images,
      amenities: amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : [],
      houseRules: houseRules || '',
      contactPhone,
      startingRent: Number(startingRent) || 0,
      status: 'pending',
    });
    res.status(201).json({ success: true, message: 'PG submitted for approval', pg });
  } catch (error) { next(error); }
};

const updatePG = async (req, res, next) => {
  try {
    const pg = await PG.findOne({ _id: req.params.id, owner: req.user._id });
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const { name, description, category, street, locality, city, pincode, state, amenities, houseRules, contactPhone, startingRent } = req.body;

    let newImages = pg.images;
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => uploadToCloudinary(file.buffer, 'pg-management/pgs'));
      const results = await Promise.all(uploadPromises);
      newImages = [...pg.images, ...results.map(r => r.secure_url)];
    }

    Object.assign(pg, {
      name: name || pg.name, description: description || pg.description, category: category || pg.category,
      address: { street: street || pg.address.street, locality: locality || pg.address.locality, city: city || pg.address.city, pincode: pincode || pg.address.pincode, state: state || pg.address.state },
      images: newImages,
      amenities: amenities ? (typeof amenities === 'string' ? JSON.parse(amenities) : amenities) : pg.amenities,
      houseRules: houseRules !== undefined ? houseRules : pg.houseRules,
      contactPhone: contactPhone || pg.contactPhone,
      startingRent: startingRent !== undefined ? Number(startingRent) : pg.startingRent,
    });
    await pg.save();
    res.json({ success: true, pg });
  } catch (error) { next(error); }
};

const deletePG = async (req, res, next) => {
  try {
    const pg = await PG.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });
    res.json({ success: true, message: 'PG deleted' });
  } catch (error) { next(error); }
};

const togglePGStatus = async (req, res, next) => {
  try {
    const pg = await PG.findOne({ _id: req.params.id, owner: req.user._id });
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });
    if (pg.status === 'pending') return res.status(400).json({ success: false, message: 'PG is pending admin approval' });
    pg.status = pg.status === 'active' ? 'inactive' : 'active';
    await pg.save();
    res.json({ success: true, pg });
  } catch (error) { next(error); }
};

// ==================== ROOM MANAGEMENT ====================
const getRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ pg: req.params.pgId, owner: req.user._id }).populate('currentTenant', 'name phone');
    res.json({ success: true, rooms });
  } catch (error) { next(error); }
};

const addRoom = async (req, res, next) => {
  try {
    const pg = await PG.findOne({ _id: req.params.pgId, owner: req.user._id });
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const { roomNumber, type, floor, isAC, rent, description } = req.body;
    const room = await Room.create({ pg: req.params.pgId, owner: req.user._id, roomNumber, type, floor: floor || 'Ground', isAC: isAC === 'true' || isAC === true, rent: Number(rent), description: description || '' });

    // Update PG room counts
    await PG.findByIdAndUpdate(req.params.pgId, { $inc: { totalRooms: 1, availableRooms: 1 } });
    res.status(201).json({ success: true, room });
  } catch (error) { next(error); }
};

const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, room });
  } catch (error) { next(error); }
};

const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    await PG.findByIdAndUpdate(room.pg, { $inc: { totalRooms: -1, availableRooms: room.status === 'vacant' ? -1 : 0 } });
    res.json({ success: true, message: 'Room deleted' });
  } catch (error) { next(error); }
};

// ==================== TENANT MANAGEMENT ====================
const getTenants = async (req, res, next) => {
  try {
    const { status, pgId } = req.query;
    const query = { owner: req.user._id };
    if (status) query.status = status;
    if (pgId) query.pg = pgId;
    const tenants = await Tenant.find(query).populate('pg', 'name').populate('room', 'roomNumber type').sort({ createdAt: -1 });
    res.json({ success: true, tenants });
  } catch (error) { next(error); }
};

const addTenant = async (req, res, next) => {
  try {
    const { pgId, roomId, name, phone, email, idProofType, joinDate, rentAmount, advancePaid, notes } = req.body;

    const room = await Room.findOne({ _id: roomId, owner: req.user._id });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    if (room.status === 'occupied') return res.status(400).json({ success: false, message: 'Room is already occupied' });

    let idProof = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'pg-management/id-proofs');
      idProof = result.secure_url;
    }

    const tenant = await Tenant.create({ owner: req.user._id, pg: pgId, room: roomId, name, phone, email: email || '', idProof, idProofType: idProofType || 'Aadhar', joinDate: new Date(joinDate), rentAmount: Number(rentAmount), advancePaid: Number(advancePaid) || 0, notes: notes || '' });

    // Mark room as occupied
    await Room.findByIdAndUpdate(roomId, { status: 'occupied', currentTenant: tenant._id });
    await PG.findByIdAndUpdate(pgId, { $inc: { availableRooms: -1 } });

    res.status(201).json({ success: true, tenant });
  } catch (error) { next(error); }
};

const updateTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body, { new: true });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });
    res.json({ success: true, tenant });
  } catch (error) { next(error); }
};

const checkoutTenant = async (req, res, next) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, owner: req.user._id });
    if (!tenant) return res.status(404).json({ success: false, message: 'Tenant not found' });

    tenant.status = 'exited';
    tenant.exitDate = new Date();
    await tenant.save();

    // Free up room
    await Room.findByIdAndUpdate(tenant.room, { status: 'vacant', currentTenant: null });
    await PG.findByIdAndUpdate(tenant.pg, { $inc: { availableRooms: 1 } });

    res.json({ success: true, message: 'Tenant checked out', tenant });
  } catch (error) { next(error); }
};

// ==================== FINANCE ====================
const getFinanceSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year) || new Date().getFullYear();

    const [payments, expenses, pendingPayments] = await Promise.all([
      Payment.find({ owner: req.user._id, month: m, year: y, status: 'paid' }),
      Expense.find({ owner: req.user._id, date: { $gte: new Date(`${y}-${m}-01`), $lt: new Date(`${y}-${m + 1}-01`) } }),
      Payment.find({ owner: req.user._id, month: m, year: y, status: 'pending' }),
    ]);

    const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalPending = pendingPayments.reduce((s, p) => s + p.amount, 0);

    res.json({ success: true, summary: { month: m, year: y, totalCollected, totalExpenses, profit: totalCollected - totalExpenses, totalPending } });
  } catch (error) { next(error); }
};

const getPayments = async (req, res, next) => {
  try {
    const { tenantId, month, year, status } = req.query;
    const query = { owner: req.user._id };
    if (tenantId) query.tenant = tenantId;
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    if (status) query.status = status;
    const payments = await Payment.find(query).populate('tenant', 'name phone').populate('pg', 'name').sort({ year: -1, month: -1 });
    res.json({ success: true, payments });
  } catch (error) { next(error); }
};

const addPayment = async (req, res, next) => {
  try {
    const { tenantId, pgId, month, year, amount, status, mode, notes } = req.body;
    const payment = await Payment.create({ tenant: tenantId, pg: pgId, owner: req.user._id, month: Number(month), year: Number(year), amount: Number(amount), status: status || 'paid', paidDate: status === 'paid' ? new Date() : null, mode: mode || 'cash', notes: notes || '' });
    res.status(201).json({ success: true, payment });
  } catch (error) { next(error); }
};

const updatePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { ...req.body, ...(req.body.status === 'paid' && { paidDate: new Date() }) }, { new: true });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, payment });
  } catch (error) { next(error); }
};

const getExpenses = async (req, res, next) => {
  try {
    const { pgId, month, year } = req.query;
    const query = { owner: req.user._id };
    if (pgId) query.pg = pgId;
    if (month && year) query.date = { $gte: new Date(`${year}-${month}-01`), $lt: new Date(`${year}-${Number(month) + 1}-01`) };
    const expenses = await Expense.find(query).populate('pg', 'name').sort({ date: -1 });
    res.json({ success: true, expenses });
  } catch (error) { next(error); }
};

const addExpense = async (req, res, next) => {
  try {
    const { pgId, category, amount, date, description } = req.body;
    const expense = await Expense.create({ pg: pgId, owner: req.user._id, category, amount: Number(amount), date: new Date(date), description: description || '' });
    res.status(201).json({ success: true, expense });
  } catch (error) { next(error); }
};

const getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find({ owner: req.user._id }).populate('pg', 'name').sort({ createdAt: -1 });
    res.json({ success: true, enquiries });
  } catch (error) { next(error); }
};

const markEnquiryRead = async (req, res, next) => {
  try {
    await Enquiry.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { isRead: true });
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) { next(error); }
};

module.exports = {
  getDashboard, getMyPGs, addPG, updatePG, deletePG, togglePGStatus,
  getRooms, addRoom, updateRoom, deleteRoom,
  getTenants, addTenant, updateTenant, checkoutTenant,
  getFinanceSummary, getPayments, addPayment, updatePayment,
  getExpenses, addExpense, getEnquiries, markEnquiryRead,
};
