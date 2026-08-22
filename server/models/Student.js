const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: { type: String, required: true, unique: true },
  surname: { type: String, required: true },
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  phone: { type: String, required: true },
  fatherPhone: { type: String, required: true },
  motherPhone: { type: String },
  dob: { type: Date, required: true },
  village: { type: String, required: true },
  taluka: { type: String, required: true },
  district: { type: String, required: true },
  pincode: { type: String },
  school: { type: String, required: true },
  college: { type: String },
  photo: { type: String, default: '' },
  course: { type: String },
  year: { type: String },
  roomNumber: { type: String },
  deposit: { type: Number, default: 0 },
  monthlyFee: { type: Number, default: 6000 },
  feeDueDay: { type: Number, default: 10 },
  joiningDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Away', 'Left'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
