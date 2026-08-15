const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    default: 'student',
  },
  // If role is student, this links to the Student profile
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
