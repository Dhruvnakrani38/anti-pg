const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomNumber: { type: String, required: true },
  type: {
    type: String,
    enum: ['single', 'double', 'triple', 'dormitory'],
    required: true,
  },
  floor: { type: String, default: 'Ground' },
  isAC: { type: Boolean, default: false },
  rent: { type: Number, required: true },
  description: { type: String, default: '' },
  status: {
    type: String,
    enum: ['vacant', 'occupied', 'maintenance'],
    default: 'vacant',
  },
  currentTenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
