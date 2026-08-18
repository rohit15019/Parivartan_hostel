const Student = require('../models/Student');
const User = require('../models/User');
const Fee = require('../models/Fee');
const bcrypt = require('bcrypt');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({}).populate({
      path: 'userId',
      select: 'email role'
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
    const student = await Student.findOne({ userId: req.user._id });
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: 'Student profile not found' });
    }
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
    totalFees, paymentFrequency, dueDate
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
      course: course || 'B.Tech',
      year: year || '1st Year',
      roomNumber
    });

    // Link student to user
    createdUser.studentId = createdStudent._id;
    await createdUser.save();

    // 3. Create initial Fee record
    const fee = await Fee.create({
      studentId: createdStudent._id,
      totalFees: totalFees || 60000,
      paymentFrequency: paymentFrequency || 'Yearly',
      dueDate: dueDate || null
    });

    res.status(201).json({ student: createdStudent, fee });
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
      surname, name, phone, fatherName, fatherPhone, motherPhone, dob, village, taluka, district, pincode, school, college, course, year, roomNumber, status
    } = req.body;

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
    if (phone !== undefined) student.phone = phone;
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

    const updatedStudent = await student.save();

    res.json(updatedStudent);
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

    // Delete associated Fee
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

module.exports = { getStudents, getStudentProfile, createStudent, updateStudent, deleteStudent };
