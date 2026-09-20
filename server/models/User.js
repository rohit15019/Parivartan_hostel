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
  rawPassword: {
    type: String,
    default: 'password123',
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
  },
  // Email OTP Verification fields
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  loginOtp: {
    type: String,
    default: null,
  },
  loginOtpExpires: {
    type: Date,
    default: null,
  },
  loginOtpAttempts: {
    type: Number,
    default: 0,
  },
  // Password Reset fields
  resetPasswordOtp: {
    type: String,
    default: null,
  },
  resetPasswordExpires: {
    type: Date,
    default: null,
  },
  resetPasswordAttempts: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
