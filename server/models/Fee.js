const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true // One active fee record per student
  },
  totalFees: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
  paymentFrequency: { type: String, enum: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly', 'Custom'], default: 'Yearly' },
  notes: { type: String }
}, { timestamps: true });

// Virtual for remaining amount
feeSchema.virtual('remainingAmount').get(function() {
  return this.totalFees - this.paidAmount;
});

// Virtual for fee status
feeSchema.virtual('status').get(function() {
  if (this.paidAmount === 0) return 'PENDING';
  if (this.paidAmount >= this.totalFees) return 'FULLY PAID';
  return 'PARTIALLY PAID';
});

// Ensure virtuals are included in JSON/Object conversions
feeSchema.set('toJSON', { virtuals: true });
feeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Fee', feeSchema);
