const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Student = require('../models/Student');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/emailService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }
  const maskedLocal = `${local.slice(0, 2)}${'*'.repeat(Math.min(4, Math.max(1, local.length - 3)))}${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
};

// Helper to ensure admin account always exists
const ensureAdminUser = async () => {
  try {
    const adminEmail = 'vallabhdharejiya9@gmail.com';
    const adminPassword = 'Admin@123';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      admin = await User.create({
        email: adminEmail,
        password: hashedPassword,
        rawPassword: adminPassword,
        role: 'admin',
        isEmailVerified: true,
      });
      console.log(`[Auth] Admin account auto-initialized: ${adminEmail}`);
    } else {
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        await admin.save();
      }
    }
    return admin;
  } catch (err) {
    console.error('[Auth] Error in ensureAdminUser:', err.message);
    return null;
  }
};

// @desc    Auth user credentials & Login (Email OTP on first login, direct login on subsequent logins)
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const rawInput = (email || '').trim();
    const cleanEmail = rawInput.toLowerCase();
    const cleanPassword = (password || '').trim();

    let user = null;

    // 1. If admin role requested or admin email typed, ensure & retrieve admin account
    if (role === 'admin' || cleanEmail === 'vallabhdharejiya9@gmail.com') {
      user = await User.findOne({
        role: 'admin',
        $or: [
          { email: cleanEmail },
          { email: 'vallabhdharejiya9@gmail.com' }
        ]
      });

      if (!user) {
        user = await ensureAdminUser();
      }
    }

    // 2. If not found, lookup by student email / ID / phone
    if (!user) {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        const studentRecord = await Student.findOne({
          $or: [
            { phone: rawInput },
            { studentId: rawInput },
            { studentId: rawInput.toUpperCase() }
          ]
        });
        if (studentRecord && studentRecord.userId) {
          user = await User.findById(studentRecord.userId);
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials. Account not found with this email / student ID.' });
    }

    // Check password matching: bcrypt compare with exact / trimmed, or rawPassword safety check
    let isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch && cleanPassword !== password) {
      isMatch = await bcrypt.compare(cleanPassword, user.password);
    }
    if (!isMatch && user.rawPassword && (user.rawPassword === password || user.rawPassword === cleanPassword)) {
      isMatch = true;
      // Rehash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password. Please check your password or use Forgot Password.' });
    }

    // Resolve user display name and photo
    let displayName = user.email.split('@')[0];
    let photo = '';
    if (user.role === 'student') {
      let student = null;
      if (user.studentId) {
        student = await Student.findById(user.studentId);
      }
      if (!student) {
        student = await Student.findOne({ userId: user._id });
      }
      if (student) {
        displayName = `${student.name}${student.surname ? ` ${student.surname}` : ''}`.trim();
        photo = student.photo || '';
      }
    } else if (user.role === 'admin') {
      displayName = 'Admin Sir (Vallabhbhai Dharajiya)';
    }

    // If account is already email verified, sign in directly without sending OTP
    if (user.isEmailVerified) {
      return res.json({
        _id: user._id,
        email: user.email,
        name: displayName,
        photo: photo,
        role: user.role,
        studentId: user.studentId,
        token: generateToken(user._id),
        message: 'Signed in successfully!',
      });
    }

    // First-Time Login: Send 6-digit OTP to verify email address
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.loginOtp = otp;
    user.loginOtpExpires = otpExpires;
    user.loginOtpAttempts = 0;
    await user.save();

    // Send OTP email
    try {
      await sendOtpEmail({
        toEmail: user.email,
        userName: displayName,
        otp: otp,
        expiresInMinutes: 10,
      });
    } catch (emailErr) {
      console.error('[Email Dispatch Error]', emailErr);
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please check your internet connection or email configuration.',
        error: emailErr.message 
      });
    }

    // Generate temporary token for OTP verification
    const tempToken = jwt.sign(
      { id: user._id, type: 'first_login_otp' },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '10m' }
    );

    res.json({
      requiresOtp: true,
      isFirstLogin: true,
      tempToken,
      maskedEmail: maskEmail(user.email),
      message: `Welcome! Please verify your email with the 6-digit code sent to ${maskEmail(user.email)}. Subsequent logins will sign in directly.`,
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message || 'An error occurred during login.' });
  }
};

// @desc    Verify First-Time Login OTP, mark email verified & complete sign in
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyLoginOtp = async (req, res) => {
  const { tempToken, otp } = req.body;

  if (!tempToken || !otp) {
    return res.status(400).json({ message: 'Temporary session token and verification code are required.' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret123');
    } catch (jwtErr) {
      return res.status(401).json({ message: 'Verification session has expired. Please sign in again.' });
    }

    if (!decoded.id || (decoded.type !== 'first_login_otp' && decoded.type !== 'login_otp')) {
      return res.status(401).json({ message: 'Invalid verification token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.loginOtp || !user.loginOtpExpires) {
      return res.status(400).json({ message: 'No active verification code found. Please sign in again.' });
    }

    if (new Date() > new Date(user.loginOtpExpires)) {
      user.loginOtp = null;
      user.loginOtpExpires = null;
      await user.save();
      return res.status(400).json({ message: 'Verification code has expired. Please request a new code.' });
    }

    if (user.loginOtpAttempts >= 5) {
      user.loginOtp = null;
      user.loginOtpExpires = null;
      user.loginOtpAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Too many incorrect attempts. Please sign in again to receive a fresh code.' });
    }

    const cleanInputOtp = otp.toString().trim();
    if (user.loginOtp !== cleanInputOtp) {
      user.loginOtpAttempts = (user.loginOtpAttempts || 0) + 1;
      await user.save();
      const remaining = 5 - user.loginOtpAttempts;
      return res.status(400).json({ 
        message: `Invalid verification code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code has been invalidated.'}` 
      });
    }

    // OTP is valid - mark email as permanently verified and clear OTP
    user.isEmailVerified = true;
    user.loginOtp = null;
    user.loginOtpExpires = null;
    user.loginOtpAttempts = 0;
    await user.save();

    // Fetch user details for client session
    let name = user.email.split('@')[0];
    let photo = '';
    if (user.role === 'student') {
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
      name = 'Admin Sir (Vallabhbhai Dharajiya)';
    }

    res.json({
      _id: user._id,
      email: user.email,
      name: name,
      photo: photo,
      role: user.role,
      studentId: user.studentId,
      token: generateToken(user._id),
      message: 'Email verified successfully! Future logins will sign in directly.',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: error.message || 'Failed to verify code.' });
  }
};

// @desc    Resend Login OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendLoginOtp = async (req, res) => {
  const { tempToken } = req.body;

  if (!tempToken) {
    return res.status(400).json({ message: 'Session token is required.' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret123');
    } catch (jwtErr) {
      return res.status(401).json({ message: 'Session has expired. Please sign in again.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let displayName = user.email.split('@')[0];
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        displayName = `${student.name}${student.surname ? ` ${student.surname}` : ''}`.trim();
      }
    } else if (user.role === 'admin') {
      displayName = 'Admin Sir';
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.loginOtp = otp;
    user.loginOtpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.loginOtpAttempts = 0;
    await user.save();

    await sendOtpEmail({
      toEmail: user.email,
      userName: displayName,
      otp: otp,
      expiresInMinutes: 10,
    });

    res.json({
      message: `A fresh 6-digit verification code has been sent to ${maskEmail(user.email)}.`,
      maskedEmail: maskEmail(user.email),
    });
  } catch (error) {
    console.error('Resend OTP Error:', error);
    res.status(500).json({ message: error.message || 'Failed to resend verification code.' });
  }
};

// @desc    Request Password Reset (Sends 6-Digit OTP to Email)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  const { email, role } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please enter your registered email, student ID, or phone.' });
  }

  try {
    let user = null;
    const cleanInput = email.trim().toLowerCase();

    if (role === 'admin') {
      // Only vallabhdharejiya9@gmail.com is authorized as admin
      user = await User.findOne({
        role: 'admin',
        $or: [
          { email: cleanInput },
          { email: 'vallabhdharejiya9@gmail.com' }
        ]
      });
    } else {
      user = await User.findOne({ email: cleanInput });
      if (!user) {
        const studentRecord = await Student.findOne({
          $or: [{ phone: email }, { studentId: email }]
        });
        if (studentRecord && studentRecord.userId) {
          user = await User.findById(studentRecord.userId);
        }
      }
    }

    if (!user) {
      return res.status(404).json({ message: 'No registered account found with these details.' });
    }

    // Resolve user display name
    let displayName = user.email.split('@')[0];
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        displayName = `${student.name}${student.surname ? ` ${student.surname}` : ''}`.trim();
      }
    } else if (user.role === 'admin') {
      displayName = 'Admin Sir (Vallabhbhai Dharajiya)';
    }

    // Generate 6-digit password reset OTP
    const resetOtp = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.resetPasswordAttempts = 0;
    await user.save();

    // Send Password Reset Email
    try {
      await sendPasswordResetEmail({
        toEmail: user.email,
        userName: displayName,
        otp: resetOtp,
        expiresInMinutes: 10,
      });
    } catch (emailErr) {
      console.error('[Forgot Password Email Error]', emailErr);
      return res.status(500).json({ 
        message: 'Failed to send password reset email. Please check your email address or SMTP configuration.',
        error: emailErr.message 
      });
    }

    const tempToken = jwt.sign(
      { id: user._id, type: 'password_reset' },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '10m' }
    );

    res.json({
      requiresOtp: true,
      tempToken,
      maskedEmail: maskEmail(user.email),
      message: `A 6-digit password reset code has been sent to ${maskEmail(user.email)}.`,
    });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: error.message || 'An error occurred while processing request.' });
  }
};

// @desc    Verify OTP and Set New Password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  const { tempToken, otp, newPassword } = req.body;

  if (!tempToken || !otp || !newPassword) {
    return res.status(400).json({ message: 'Session token, verification code, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret123');
    } catch (jwtErr) {
      return res.status(401).json({ message: 'Reset session has expired. Please request a new code.' });
    }

    if (decoded.type !== 'password_reset' || !decoded.id) {
      return res.status(401).json({ message: 'Invalid reset token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordExpires) {
      return res.status(400).json({ message: 'No active password reset request found. Please request a new code.' });
    }

    if (new Date() > new Date(user.resetPasswordExpires)) {
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(400).json({ message: 'Password reset code has expired. Please request a new code.' });
    }

    if (user.resetPasswordAttempts >= 5) {
      user.resetPasswordOtp = null;
      user.resetPasswordExpires = null;
      user.resetPasswordAttempts = 0;
      await user.save();
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new reset code.' });
    }

    const cleanInputOtp = otp.toString().trim();
    if (user.resetPasswordOtp !== cleanInputOtp) {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      await user.save();
      const remaining = 5 - user.resetPasswordAttempts;
      return res.status(400).json({ 
        message: `Invalid code. ${remaining > 0 ? `${remaining} attempt(s) remaining.` : 'Code has been invalidated.'}` 
      });
    }

    // OTP verified - update password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.rawPassword = newPassword;
    user.isEmailVerified = true;
    user.resetPasswordOtp = null;
    user.resetPasswordExpires = null;
    user.resetPasswordAttempts = 0;
    await user.save();

    res.json({
      message: 'Password reset successfully! You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({ message: error.message || 'Failed to reset password.' });
  }
};

// @desc    Resend Password Reset OTP
// @route   POST /api/auth/resend-reset-otp
// @access  Public
const resendResetOtp = async (req, res) => {
  const { tempToken } = req.body;

  if (!tempToken) {
    return res.status(400).json({ message: 'Session token is required.' });
  }

  try {
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret123');
    } catch (jwtErr) {
      return res.status(401).json({ message: 'Session has expired. Please request a new code.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let displayName = user.email.split('@')[0];
    if (user.role === 'student') {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        displayName = `${student.name}${student.surname ? ` ${student.surname}` : ''}`.trim();
      }
    } else if (user.role === 'admin') {
      displayName = 'Admin Sir';
    }

    const resetOtp = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.resetPasswordAttempts = 0;
    await user.save();

    await sendPasswordResetEmail({
      toEmail: user.email,
      userName: displayName,
      otp: resetOtp,
      expiresInMinutes: 10,
    });

    res.json({
      message: `A fresh password reset code has been sent to ${maskEmail(user.email)}.`,
      maskedEmail: maskEmail(user.email),
    });
  } catch (error) {
    console.error('Resend Reset OTP Error:', error);
    res.status(500).json({ message: error.message || 'Failed to resend code.' });
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
      rawPassword: password,
      role: role || 'student',
      isEmailVerified: false,
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

module.exports = {
  authUser,
  verifyLoginOtp,
  resendLoginOtp,
  forgotPassword,
  resetPassword,
  resendResetOtp,
  registerUser,
  ensureAdminUser,
};
