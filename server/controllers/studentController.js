const Student = require('../models/Student');
const User = require('../models/User');
const Fee = require('../models/Fee');
const MonthlyFee = require('../models/MonthlyFee');
const { ensureMonthlyFeesForStudent } = require('./feeController');
const bcrypt = require('bcrypt');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({}).populate({
      path: 'userId',
      select: 'email role rawPassword'
    });
    
    // Attach fee info
    const studentsWithFees = await Promise.all(students.map(async (student) => {
       const fee = await Fee.findOne({ studentId: student._id });
       return {
         ...student._doc,
         fee: fee || null
       }
    }));

    res.json(studentsWithFees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student profile
// @route   GET /api/students/profile
// @access  Private/Student
const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate('userId', 'email');
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload or update student profile photo
// @route   PUT /api/students/profile/photo
// @access  Private/Student
const uploadStudentPhoto = async (req, res) => {
  try {
    const { photo } = req.body;
    if (!photo) {
      return res.status(400).json({ message: 'No photo data provided' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    student.photo = photo;
    await student.save();

    res.json({
      message: 'Profile photo updated successfully',
      photo: student.photo,
      student
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new student & user account
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res) => {
  let {
    studentId, surname, name, email, password, phone,
    fatherName, fatherPhone, motherPhone, dob, village, taluka, district, pincode, school,
    college, course, year, roomNumber,
    totalFees, paymentFrequency, dueDate,
    deposit, monthlyFee, feeDueDay
  } = req.body;

  let createdUser = null;
  let createdStudent = null;

  try {
    // Generate email if missing
    if (!email) {
      email = `student_${Date.now()}_${Math.floor(Math.random() * 1000)}@hostel.com`;
    }

    // Default password if missing
    if (!password) {
      password = 'password123';
    }

    // Check if a student with this mobile number already exists
    if (phone) {
      const cleanPhone = phone.trim();
      const existingStudentPhone = await Student.findOne({ phone: cleanPhone });
      if (existingStudentPhone) {
        return res.status(400).json({ message: 'A student with this mobile number already exists' });
      }
    }

    // Validate required deposit and monthly fee rate
    if (deposit === undefined || deposit === null || deposit === '' || isNaN(Number(deposit)) || Number(deposit) < 0) {
      return res.status(400).json({ message: 'Deposit amount is required and must be 0 or greater' });
    }
    if (monthlyFee === undefined || monthlyFee === null || monthlyFee === '' || isNaN(Number(monthlyFee)) || Number(monthlyFee) <= 0) {
      return res.status(400).json({ message: 'Monthly fee rate is required and must be greater than 0' });
    }

    // 1. Create User
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check Room Capacity
    if (roomNumber) {
      const Room = require('../models/Room');
      const room = await Room.findOne({ roomNumber });
      if (room) {
        const occupants = await Student.countDocuments({ roomNumber });
        if (occupants >= room.capacity) {
          return res.status(400).json({ message: `Room ${roomNumber} is already full (Capacity: ${room.capacity})` });
        }
      } else {
        return res.status(400).json({ message: `Room ${roomNumber} not found` });
      }
    }

    // Auto-generate studentId if not provided or already taken
    const currentYear = new Date().getFullYear();
    const prefix = `STU-${currentYear}-`;
    if (!studentId || await Student.findOne({ studentId })) {
      const existingStudents = await Student.find({ studentId: new RegExp(`^${prefix}`) }).select('studentId');
      let maxNum = 0;
      for (const s of existingStudents) {
        const numPart = parseInt(s.studentId.replace(prefix, ''), 10);
        if (!isNaN(numPart) && numPart > maxNum) {
          maxNum = numPart;
        }
      }
      let nextNum = maxNum + 1;
      studentId = `${prefix}${String(nextNum).padStart(3, '0')}`;
      while (await Student.findOne({ studentId })) {
        nextNum++;
        studentId = `${prefix}${String(nextNum).padStart(3, '0')}`;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    createdUser = await User.create({
      email,
      password: hashedPassword,
      rawPassword: password,
      role: 'student'
    });

    // 2. Create Student
    createdStudent = await Student.create({
      userId: createdUser._id,
      studentId,
      surname,
      name,
      phone,
      fatherName,
      fatherPhone,
      motherPhone: motherPhone || '',
      dob,
      village,
      taluka,
      district,
      pincode: pincode || '',
      school,
      college: college || '',
      course: course || '',
      year: year || '1st Year',
      roomNumber,
      deposit: Number(deposit),
      monthlyFee: Number(monthlyFee),
      feeDueDay: Number(feeDueDay) || 10
    });

    // Link student to user
    createdUser.studentId = createdStudent._id;
    await createdUser.save();

    // 3. Ensure monthly fee records and sync
    const feeSync = await ensureMonthlyFeesForStudent(createdStudent._id);

    res.status(201).json({ student: createdStudent, fee: feeSync?.monthlyFees?.[0] || null });
  } catch (error) {
    // Rollback created user and student if an error occurs
    if (createdUser) {
      await User.findByIdAndDelete(createdUser._id).catch(() => {});
    }
    if (createdStudent) {
      await Student.findByIdAndDelete(createdStudent._id).catch(() => {});
    }
    res.status(400).json({ message: error.message || 'Failed to create student' });
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const {
      email, password, newPassword, surname, name, phone, fatherName, fatherPhone, motherPhone, dob, village, taluka, district, pincode, school, college, course, year, roomNumber, status,
      deposit, monthlyFee, feeDueDay
    } = req.body;

    // Handle email & password updates on associated User model
    if (student.userId) {
      const userUpdates = {};
      if (email) {
        const emailLower = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: emailLower, _id: { $ne: student.userId } });
        if (existingUser) {
          return res.status(400).json({ message: 'Email address is already in use by another account' });
        }
        userUpdates.email = emailLower;
      }
      const passToSet = newPassword || password;
      if (passToSet && passToSet.trim().length >= 4) {
        const salt = await bcrypt.genSalt(10);
        userUpdates.password = await bcrypt.hash(passToSet.trim(), salt);
        userUpdates.rawPassword = passToSet.trim();
      }
      if (Object.keys(userUpdates).length > 0) {
        await User.findByIdAndUpdate(student.userId, userUpdates);
      }
    }

    if (roomNumber !== undefined && roomNumber !== student.roomNumber) {
      const Room = require('../models/Room');
      const room = await Room.findOne({ roomNumber });
      if (room) {
        const occupants = await Student.countDocuments({ roomNumber });
        if (occupants >= room.capacity) {
          return res.status(400).json({ message: 'Room is already full' });
        }
      } else {
        return res.status(400).json({ message: 'Room not found' });
      }
      student.roomNumber = roomNumber;
    }

    if (surname !== undefined) student.surname = surname;
    if (name !== undefined) student.name = name;
    if (phone !== undefined) {
      const cleanPhone = phone.trim();
      if (cleanPhone !== student.phone) {
        const existingStudentPhone = await Student.findOne({ phone: cleanPhone, _id: { $ne: student._id } });
        if (existingStudentPhone) {
          return res.status(400).json({ message: 'A student with this mobile number already exists' });
        }
      }
      student.phone = cleanPhone;
    }
    if (fatherName !== undefined) student.fatherName = fatherName;
    if (fatherPhone !== undefined) student.fatherPhone = fatherPhone;
    if (motherPhone !== undefined) student.motherPhone = motherPhone;
    if (dob !== undefined) student.dob = dob;
    if (village !== undefined) student.village = village;
    if (taluka !== undefined) student.taluka = taluka;
    if (district !== undefined) student.district = district;
    if (pincode !== undefined) student.pincode = pincode;
    if (school !== undefined) student.school = school;
    if (college !== undefined) student.college = college;
    if (course !== undefined) student.course = course;
    if (year !== undefined) student.year = year;
    if (status !== undefined) student.status = status;
    if (deposit !== undefined) {
      if (deposit === null || deposit === '' || isNaN(Number(deposit)) || Number(deposit) < 0) {
        return res.status(400).json({ message: 'Deposit amount is required and must be 0 or greater' });
      }
      student.deposit = Number(deposit);
    }
    if (monthlyFee !== undefined) {
      if (monthlyFee === null || monthlyFee === '' || isNaN(Number(monthlyFee)) || Number(monthlyFee) <= 0) {
        return res.status(400).json({ message: 'Monthly fee rate is required and must be greater than 0' });
      }
      student.monthlyFee = Number(monthlyFee);
    }
    if (feeDueDay !== undefined) student.feeDueDay = Math.min(28, Math.max(1, Number(feeDueDay)));

    await student.save();

    // Sync monthly fees if fee rate changed
    await ensureMonthlyFeesForStudent(student._id);

    const updatedPopulated = await Student.findById(student._id).populate({
      path: 'userId',
      select: 'email role rawPassword'
    });

    const fee = await Fee.findOne({ studentId: student._id });

    res.json({
      ...updatedPopulated._doc,
      fee: fee || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change student password by admin
// @route   PUT /api/students/:id/password
// @access  Private/Admin
const changeStudentPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.trim().length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters long' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.userId) {
      return res.status(404).json({ message: 'Associated user account not found' });
    }

    const user = await User.findById(student.userId);
    if (!user) {
      return res.status(404).json({ message: 'User account not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword.trim(), salt);

    user.password = hashedPassword;
    user.rawPassword = newPassword.trim();
    await user.save();

    res.json({
      message: 'Password updated successfully',
      rawPassword: user.rawPassword
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete associated User
    if (student.userId) {
      await User.findByIdAndDelete(student.userId);
    }

    // Delete associated MonthlyFees & Fees
    await MonthlyFee.deleteMany({ studentId: student._id });
    await Fee.findOneAndDelete({ studentId: student._id });

    // Delete associated Payments and Leave Requests
    const Payment = require('../models/Payment');
    const LeaveRequest = require('../models/LeaveRequest');
    await Payment.deleteMany({ studentId: student._id });
    await LeaveRequest.deleteMany({ studentId: student._id });

    // Delete Student
    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudents, getStudentProfile, uploadStudentPhoto, createStudent, updateStudent, changeStudentPassword, deleteStudent };
