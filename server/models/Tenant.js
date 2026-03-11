const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  idProof: { type: String, default: '' }, // URL to uploaded ID
  idProofType: { type: String, default: 'Aadhar' },
  joinDate: { type: Date, required: true },
  exitDate: { type: Date, default: null },
  rentAmount: { type: Number, required: true },
  advancePaid: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'exited'], default: 'active' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
