const mongoose = require('mongoose');

const profileRequestSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  requestText: {
    type: String,
    required: [true, 'Please provide details of the changes you want to make'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  adminNotes: {
    type: String,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ProfileRequest', profileRequestSchema);
