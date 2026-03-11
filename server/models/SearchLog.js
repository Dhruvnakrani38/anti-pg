const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
  query: { type: String, default: '' },
  city: { type: String, default: '' },
  filters: { type: Object, default: {} },
  pgId: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', default: null }, // for PG views
  type: { type: String, enum: ['search', 'view'], default: 'search' },
  ip: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SearchLog', searchLogSchema);
