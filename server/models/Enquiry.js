const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  message: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
