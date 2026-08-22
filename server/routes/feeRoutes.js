const express = require('express');
const router = express.Router();
const {
  getStudentFeeDetails,
  updateStudentFee,
  recordPayment,
  getAllPayments,
  deletePayment,
  getAllStudentFees,
  autoRenewAllFees,
  bulkUpdateStudentFees,
  updateMonthlyFeeRecord
} = require('../controllers/feeController');
const { protect, admin } = require('../middleware/authMiddleware');

// Student Fees list and Bulk Operations
router.route('/student-fees')
  .get(protect, admin, getAllStudentFees);

router.route('/auto-renew')
  .post(protect, admin, autoRenewAllFees);

router.route('/bulk-update')
  .put(protect, admin, bulkUpdateStudentFees);

router.route('/monthly-records/:id')
  .put(protect, admin, updateMonthlyFeeRecord);

// Payments routes
router.route('/all-payments')
  .get(protect, admin, getAllPayments);

router.route('/payments/:id')
  .delete(protect, admin, deletePayment);

// Individual Student Fee and Payment routes (Parameterized - keep at bottom)
router.route('/:studentId')
  .get(protect, getStudentFeeDetails)
  .put(protect, admin, updateStudentFee);

router.route('/:studentId/payments')
  .post(protect, admin, recordPayment);

module.exports = router;
