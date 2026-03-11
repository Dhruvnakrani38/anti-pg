const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true }, // 1-12
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'pending', 'partial'], default: 'pending' },
  paidDate: { type: Date, default: null },
  mode: {
    type: String,
    enum: ['cash', 'upi', 'bank', 'other'],
    default: 'cash',
  },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
