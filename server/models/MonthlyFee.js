const mongoose = require('mongoose');

const monthlyFeeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    index: true
  },
  monthYear: {
    type: String,
    required: true, // format: "YYYY-MM", e.g., "2026-03"
    trim: true
  },
  year: {
    type: Number,
    required: true // e.g., 2026
  },
  month: {
    type: Number,
    required: true, // 1 to 12
    min: 1,
    max: 12
  },
  monthName: {
    type: String,
    required: true, // e.g., "March 2026"
    trim: true
  },
  amount: {
    type: Number,
    required: true, // monthly fee rate, e.g. 6000
    default: 6000
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['PENDING', 'PARTIALLY PAID', 'PAID'],
    default: 'PENDING'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Compound unique index so a student only has one record per monthYear
monthlyFeeSchema.index({ studentId: 1, monthYear: 1 }, { unique: true });

// Virtual for remaining/pending amount for this month
monthlyFeeSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.amount - this.paidAmount);
});

monthlyFeeSchema.set('toJSON', { virtuals: true });
monthlyFeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('MonthlyFee', monthlyFeeSchema);
