const mongoose = require('mongoose');

const yearlyFeeSchema = new mongoose.Schema({
  academicYear: {
    type: String,
    required: true,
    trim: true // e.g., "2025-2026"
  },
  title: {
    type: String,
    default: 'Hostel & Mess Fee',
    trim: true
  },
  applicableFor: {
    type: String,
    default: 'All Students', // "All Students", "1st Year", "2nd Year", "3rd Year", "4th Year"
    trim: true
  },
  dailyFee: {
    type: Number,
    default: 200 // e.g. ₹200/day
  },
  daysPerMonth: {
    type: Number,
    default: 30 // e.g. 30 days
  },
  monthFee: {
    type: Number,
    default: 6000 // dailyFee * daysPerMonth
  },
  monthsCount: {
    type: Number,
    default: 10 // e.g. 10 or 12 months in academic session
  },
  hostelFee: {
    type: Number,
    default: 0
  },
  messFee: {
    type: Number,
    default: 0
  },
  maintenanceFee: {
    type: Number,
    default: 0
  },
  otherFee: {
    type: Number,
    default: 0
  },
  totalFees: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  paymentFrequency: {
    type: String,
    enum: ['Monthly', 'Yearly', 'Half-Yearly', 'Quarterly', 'Custom'],
    default: 'Monthly'
  },
  status: {
    type: String,
    enum: ['Active', 'Upcoming', 'Archived'],
    default: 'Active'
  },
  notes: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('YearlyFee', yearlyFeeSchema);
