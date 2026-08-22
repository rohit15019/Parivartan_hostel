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

    if (user && (await bcrypt.compare(password, user.password))) {
      if (user.role !== role) {
        return res.status(401).json({ message: `User is not a ${role}` });
      }

      let name = user.email.split('@')[0]; // fallback
      let photo = '';
      if (user.role === 'student') {
        const Student = require('../models/Student');
        let student = null;
        if (user.studentId) {
          student = await Student.findById(user.studentId);
        }
        if (!student) {
          student = await Student.findOne({ userId: user._id });
        }
        if (student) {
          name = `${student.name}${student.surname ? ` ${student.surname}` : ''}`.trim();
          photo = student.photo || '';
        }
      } else if (user.role === 'admin') {
        name = 'Admin Sir';
      }

      res.json({
        _id: user._id,
        email: user.email,
        name: name,
        photo: photo,
        role: user.role,
        studentId: user.studentId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
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
