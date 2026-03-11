const PG = require('../models/PG');
const SearchLog = require('../models/SearchLog');
const Enquiry = require('../models/Enquiry');

// @desc  Search PGs (public)
// @route GET /api/public/pgs
const searchPGs = async (req, res, next) => {
  try {
    const { city, locality, category, minRent, maxRent, amenities, available, sort, page = 1, limit = 12 } = req.query;
    const query = { status: 'active' };

    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (locality) query['address.locality'] = { $regex: locality, $options: 'i' };
    if (category) query.category = category;
    if (minRent || maxRent) query.startingRent = { ...(minRent && { $gte: Number(minRent) }), ...(maxRent && { $lte: Number(maxRent) }) };
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }
    if (available === 'true') query.availableRooms = { $gt: 0 };

    let sortQuery = { createdAt: -1 };
    if (sort === 'price_asc') sortQuery = { startingRent: 1 };
    if (sort === 'price_desc') sortQuery = { startingRent: -1 };
    if (sort === 'rating') sortQuery = { rating: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const [pgs, total] = await Promise.all([
      PG.find(query).sort(sortQuery).skip(skip).limit(Number(limit)).select('-owner'),
      PG.countDocuments(query),
    ]);

    // Log search
    await SearchLog.create({ query: city || '', city: city || '', filters: req.query, type: 'search', ip: req.ip });

    res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), pgs });
  } catch (error) { next(error); }
};

// @desc  Get PG detail (public)
// @route GET /api/public/pgs/:id
const getPGDetail = async (req, res, next) => {
  try {
    const pg = await PG.findById(req.params.id).populate('owner', 'name phone');
    if (!pg || pg.status !== 'active') return res.status(404).json({ success: false, message: 'PG not found' });

    // Log view
    await SearchLog.create({ pgId: pg._id, type: 'view', ip: req.ip });

    res.json({ success: true, pg });
  } catch (error) { next(error); }
};

// @desc  Get list of all cities with active PGs
// @route GET /api/public/cities
const getCities = async (req, res, next) => {
  try {
    const cities = await PG.distinct('address.city', { status: 'active' });
    const citiesWithCount = await Promise.all(
      cities.map(async (city) => {
        const count = await PG.countDocuments({ 'address.city': city, status: 'active' });
        return { city, count };
      })
    );
    res.json({ success: true, cities: citiesWithCount.sort((a, b) => b.count - a.count) });
  } catch (error) { next(error); }
};

// @desc  Get featured PGs for home page
// @route GET /api/public/featured
const getFeaturedPGs = async (req, res, next) => {
  try {
    const featured = await PG.find({ status: 'active' }).sort({ rating: -1, createdAt: -1 }).limit(8).select('-owner');
    res.json({ success: true, pgs: featured });
  } catch (error) { next(error); }
};

// @desc  Submit enquiry
// @route POST /api/public/enquiry
const submitEnquiry = async (req, res, next) => {
  try {
    const { pgId, name, phone, email, message } = req.body;
    if (!pgId || !name || !phone) return res.status(400).json({ success: false, message: 'PG ID, name and phone are required' });

    const pg = await PG.findById(pgId);
    if (!pg) return res.status(404).json({ success: false, message: 'PG not found' });

    const enquiry = await Enquiry.create({ pg: pgId, owner: pg.owner, name, phone, email: email || '', message: message || '' });
    res.status(201).json({ success: true, message: 'Enquiry submitted successfully', enquiry });
  } catch (error) { next(error); }
};

// @desc  Get platform stats for home page
// @route GET /api/public/stats
const getPlatformStats = async (req, res, next) => {
  try {
    const [totalPGs, cities, totalSearches] = await Promise.all([
      PG.countDocuments({ status: 'active' }),
      PG.distinct('address.city', { status: 'active' }),
      SearchLog.countDocuments({ type: 'search' }),
    ]);
    res.json({ success: true, stats: { totalPGs, totalCities: cities.length, totalSearches } });
  } catch (error) { next(error); }
};

module.exports = { searchPGs, getPGDetail, getCities, getFeaturedPGs, submitEnquiry, getPlatformStats };
