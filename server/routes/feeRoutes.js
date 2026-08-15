const express = require('express');
const router = express.Router();
const { getStudentFeeDetails, updateStudentFee, recordPayment, getAllPayments, deletePayment } = require('../controllers/feeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/all-payments')
  .get(protect, admin, getAllPayments);

router.route('/payments/:id')
  .delete(protect, admin, deletePayment);

router.route('/:studentId')
  .get(protect, getStudentFeeDetails)
  .put(protect, admin, updateStudentFee);

router.route('/:studentId/payments')
  .post(protect, admin, recordPayment);

module.exports = router;
