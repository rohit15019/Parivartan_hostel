const mongoose = require('mongoose');

const librarySeatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  section: {
    type: String,
    default: 'Main Hall',
    trim: true
  },
  floor: {
    type: Number,
    default: 1
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    default: null
  },
  assignedDate: {
    type: Date,
    default: null
  },
  feePaid: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LibrarySeat', librarySeatSchema);
