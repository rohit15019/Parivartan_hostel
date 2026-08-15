const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user && role === 'student') {
      const Student = require('../models/Student');
      const studentRecord = await Student.findOne({
        $or: [{ phone: email }, { studentId: email }]
      });
      if (studentRecord && studentRecord.userId) {
        user = await User.findById(studentRecord.userId);
      }
    }

    // ==== DEV BYPASS: create user if not exists ====
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password || 'devpass', salt);
      user = await User.create({
        email: email,
        password: hashedPassword,
        role: role || 'admin'
      });
    }

    // ==== DEV BYPASS: update role if mismatch ====
    if (user.role !== role) {
      user.role = role;
      await user.save();
    }

    let name = user.email.split('@')[0]; // fallback
    if (user.role === 'student' && user.studentId) {
      const Student = require('../models/Student');
      const student = await Student.findById(user.studentId);
      if (student) name = student.name + (student.surname ? ` ${student.surname}` : '');
    } else if (user.role === 'admin') {
      name = 'Admin';
    }

    // ==== DEV BYPASS: no password check ====
    res.json({
      _id: user._id,
      email: user.email,
      name: name,
      role: user.role,
      studentId: user.studentId,
      token: generateToken(user._id),
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user (Internal/Admin tool)
// @route   POST /api/auth/register
// @access  Private/Admin
const registerUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: role || 'student',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { authUser, registerUser };
