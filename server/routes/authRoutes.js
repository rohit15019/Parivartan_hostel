const express = require('express');
const router = express.Router();
const { 
  authUser, 
  verifyLoginOtp, 
  resendLoginOtp, 
  forgotPassword,
  resetPassword,
  resendResetOtp,
  registerUser 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/login', authUser);
router.post('/verify-otp', verifyLoginOtp);
router.post('/resend-otp', resendLoginOtp);

// Forgot & Reset Password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-reset-otp', resendResetOtp);

// Admin user creation
router.post('/register', protect, admin, registerUser);

module.exports = router;
