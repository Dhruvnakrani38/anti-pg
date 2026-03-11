const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  pg: { type: mongoose.Schema.Types.ObjectId, ref: 'PG', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['electricity', 'water', 'maintenance', 'salary', 'internet', 'other'],
    required: true,
  },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
