const mongoose = require('mongoose');

const pgSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['boys', 'girls', 'coed', 'couple'],
    required: true,
  },
  address: {
    street: { type: String, required: true },
    locality: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
  images: [{ type: String }],
  amenities: [{ type: String }],
  houseRules: { type: String, default: '' },
  contactPhone: { type: String, required: true },
  startingRent: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'rejected'],
    default: 'pending',
  },
  rejectionReason: { type: String, default: '' },
  totalRooms: { type: Number, default: 0 },
  availableRooms: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });

// Full-text search index
pgSchema.index({ 'address.city': 'text', 'address.locality': 'text', name: 'text' });

module.exports = mongoose.model('PG', pgSchema);
