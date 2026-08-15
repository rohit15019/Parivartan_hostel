const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque'], required: true },
  transactionId: { type: String }, // Optional ref number
  paymentDate: { type: Date, default: Date.now },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
