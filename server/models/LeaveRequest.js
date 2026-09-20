const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  leaveType: { type: String, enum: ['Home Visit', 'Emergency', 'Personal Work', 'Other'], default: 'Home Visit' },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, default: null },
  days: { type: Number, default: 1 },
  reason: { type: String, required: true },
  parentPhone: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'DENIED'], default: 'PENDING' },
  adminComment: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
