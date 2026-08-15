const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  leaveType: { type: String, enum: ['Home Visit', 'Emergency', 'Personal Work', 'Other'], required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  days: { type: Number, required: true },
  reason: { type: String, required: true },
  parentPhone: { type: String },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'DENIED'], default: 'PENDING' },
  adminComment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
