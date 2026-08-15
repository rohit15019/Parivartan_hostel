const Fee = require('../models/Fee');
const Payment = require('../models/Payment');

// @desc    Get fee details and payment history for a student
// @route   GET /api/fees/:studentId
// @access  Private
const getStudentFeeDetails = async (req, res) => {
  try {
    const fee = await Fee.findOne({ studentId: req.params.studentId });
    if (!fee) {
      return res.status(404).json({ message: 'Fee record not found' });
    }

    const payments = await Payment.find({ studentId: req.params.studentId }).sort({ paymentDate: -1 });

    res.json({
      fee,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update total fee for a student
// @route   PUT /api/fees/:studentId
// @access  Private/Admin
const updateStudentFee = async (req, res) => {
  const { totalFees, dueDate, paymentFrequency, notes } = req.body;

  try {
    let fee = await Fee.findOne({ studentId: req.params.studentId });

    if (fee) {
      if (totalFees !== undefined) fee.totalFees = totalFees;
      if (dueDate !== undefined) fee.dueDate = dueDate;
      if (paymentFrequency !== undefined) fee.paymentFrequency = paymentFrequency;
      if (notes !== undefined) fee.notes = notes;

      const updatedFee = await fee.save();
      res.json(updatedFee);
    } else {
      res.status(404).json({ message: 'Fee record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record a new payment
// @route   POST /api/fees/:studentId/payments
// @access  Private/Admin
const recordPayment = async (req, res) => {
  const { amount, paymentMethod, transactionId, paymentDate, notes } = req.body;
  const studentId = req.params.studentId;

  try {
    // 1. Create payment record
    const payment = await Payment.create({
      studentId,
      amount,
      paymentMethod,
      transactionId,
      paymentDate: paymentDate || Date.now(),
      notes
    });

    // 2. Update fee record
    const fee = await Fee.findOne({ studentId });
    if (fee) {
      fee.paidAmount += Number(amount);
      await fee.save();
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/fees/all-payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('studentId', 'name studentId roomNumber phone')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a payment
// @route   DELETE /api/fees/payments/:id
// @access  Private/Admin
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Update fee record to subtract the deleted amount
    const fee = await Fee.findOne({ studentId: payment.studentId });
    if (fee) {
      fee.paidAmount -= payment.amount;
      if (fee.paidAmount < 0) fee.paidAmount = 0;
      await fee.save();
    }

    await payment.deleteOne();
    res.json({ message: 'Payment removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStudentFeeDetails, updateStudentFee, recordPayment, getAllPayments, deletePayment };
