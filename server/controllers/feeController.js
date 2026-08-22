const MonthlyFee = require('../models/MonthlyFee');
const Fee = require('../models/Fee');
const Payment = require('../models/Payment');
const Student = require('../models/Student');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Ensures monthly fee records exist for a student from their start/joining date up to current month.
 * Automatically redistributes all recorded payments FIFO (oldest unpaid month first).
 */
const ensureMonthlyFeesForStudent = async (studentId) => {
  const student = await Student.findById(studentId);
  if (!student) return null;

  const monthlyRate = Number(student.monthlyFee) || 6000;
  const dueDay = Number(student.feeDueDay) || 10;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Determine starting month from joiningDate or start of current year
  let startDate = student.joiningDate ? new Date(student.joiningDate) : new Date(currentYear, 0, 1);
  if (isNaN(startDate.getTime()) || startDate > now) {
    startDate = new Date(currentYear, currentMonth - 1, 1);
  }

  // Cap lookback to max 12 months in the past to avoid runaway back-dating
  const minStartDate = new Date(currentYear - 1, currentMonth - 1, 1);
  if (startDate < minStartDate) {
    startDate = minStartDate;
  }

  let startYear = startDate.getFullYear();
  let startMonth = startDate.getMonth() + 1;

  // Build the chronological list of month-years to ensure
  const monthList = [];
  let y = startYear;
  let m = startMonth;

  while (y < currentYear || (y === currentYear && m <= currentMonth)) {
    const monthYear = `${y}-${String(m).padStart(2, '0')}`;
    const monthName = `${MONTH_NAMES[m - 1]} ${y}`;
    const dueDate = new Date(y, m - 1, Math.min(dueDay, 28));
    monthList.push({ year: y, month: m, monthYear, monthName, dueDate });

    m++;
    if (m > 12) {
      m = 1;
      y++;
    }
  }

  // Create any missing MonthlyFee documents
  for (const item of monthList) {
    const existing = await MonthlyFee.findOne({ studentId: student._id, monthYear: item.monthYear });
    if (!existing) {
      await MonthlyFee.create({
        studentId: student._id,
        monthYear: item.monthYear,
        year: item.year,
        month: item.month,
        monthName: item.monthName,
        amount: monthlyRate,
        paidAmount: 0,
        dueDate: item.dueDate,
        status: 'PENDING'
      });
    }
  }

  // Fetch all monthly fees for this student in ascending order
  const monthlyFees = await MonthlyFee.find({ studentId: student._id }).sort({ year: 1, month: 1 });

  // Fetch all payments for this student
  const payments = await Payment.find({ studentId: student._id }).sort({ paymentDate: 1, createdAt: 1 });
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Redistribute payments FIFO across monthly fees (oldest first)
  let remainingPaid = totalPaid;
  for (const mf of monthlyFees) {
    const feeAmount = Number(mf.amount) || 0;
    if (remainingPaid >= feeAmount) {
      mf.paidAmount = feeAmount;
      mf.status = 'PAID';
      remainingPaid -= feeAmount;
    } else if (remainingPaid > 0) {
      mf.paidAmount = remainingPaid;
      mf.status = 'PARTIALLY PAID';
      remainingPaid = 0;
    } else {
      mf.paidAmount = 0;
      mf.status = 'PENDING';
    }
    await mf.save();
  }

  // Sync legacy Fee model for backwards compatibility
  const totalBilled = monthlyFees.reduce((sum, mf) => sum + (Number(mf.amount) || 0), 0);
  const currentMonthYear = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
  const currentMonthFee = monthlyFees.find(mf => mf.monthYear === currentMonthYear) || monthlyFees[monthlyFees.length - 1];

  let legacyFee = await Fee.findOne({ studentId: student._id });
  if (legacyFee) {
    legacyFee.totalFees = totalBilled;
    legacyFee.paidAmount = totalPaid;
    legacyFee.paymentFrequency = 'Monthly';
    if (currentMonthFee?.dueDate) legacyFee.dueDate = currentMonthFee.dueDate;
    await legacyFee.save();
  } else {
    await Fee.create({
      studentId: student._id,
      totalFees: totalBilled,
      paidAmount: totalPaid,
      paymentFrequency: 'Monthly',
      dueDate: currentMonthFee?.dueDate || null
    });
  }

  return { student, monthlyFees, payments, totalPaid, totalBilled };
};

/**
 * Ensures monthly fees for all active students.
 */
const ensureMonthlyFeesForAllStudents = async () => {
  const activeStudents = await Student.find({ status: { $ne: 'Left' } });
  let count = 0;
  for (const s of activeStudents) {
    await ensureMonthlyFeesForStudent(s._id);
    count++;
  }
  const now = new Date();
  const currentMonthName = `${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  return { updatedStudentsCount: count, currentMonthName };
};

// @desc    Get monthly fee details and payment history for a student
// @route   GET /api/fees/:studentId
// @access  Private
const getStudentFeeDetails = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const syncData = await ensureMonthlyFeesForStudent(studentId);
    if (!syncData) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { student, monthlyFees, payments, totalPaid, totalBilled } = syncData;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthYear = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const currentMonthRecord = monthlyFees.find(mf => mf.monthYear === currentMonthYear) || monthlyFees[monthlyFees.length - 1] || null;

    // Previous unpaid months (where monthYear < currentMonthYear and remaining > 0)
    const previousUnpaidMonths = monthlyFees.filter(mf => {
      const isPastMonth = mf.monthYear < currentMonthYear;
      const hasUnpaid = (Number(mf.amount) - Number(mf.paidAmount)) > 0;
      return isPastMonth && hasUnpaid;
    });

    const previousPendingDues = previousUnpaidMonths.reduce((sum, mf) => sum + Math.max(0, Number(mf.amount) - Number(mf.paidAmount)), 0);
    const currentMonthRemaining = currentMonthRecord ? Math.max(0, Number(currentMonthRecord.amount) - Number(currentMonthRecord.paidAmount)) : 0;
    const totalPendingBalance = previousPendingDues + currentMonthRemaining;

    // Overall fee status
    let feeStatus = 'PENDING';
    if (totalPendingBalance === 0 && totalBilled > 0) {
      feeStatus = 'FULLY PAID';
    } else if (totalPaid > 0) {
      feeStatus = 'PARTIALLY PAID';
    }

    // Sorted payments (newest first)
    const sortedPayments = [...payments].sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    // Sorted monthly breakdown (newest first)
    const monthlyBreakdown = [...monthlyFees].sort((a, b) => b.monthYear.localeCompare(a.monthYear));

    // Legacy fee compatibility object
    const fee = {
      totalFees: totalBilled,
      paidAmount: totalPaid,
      remainingAmount: totalPendingBalance,
      currentMonthFee: currentMonthRecord ? currentMonthRecord.amount : (student.monthlyFee || 6000),
      currentMonthPaid: currentMonthRecord ? currentMonthRecord.paidAmount : 0,
      currentMonthRemaining,
      previousPendingDues,
      status: feeStatus,
      paymentFrequency: 'Monthly',
      dueDate: currentMonthRecord?.dueDate || null,
      currentMonthName: currentMonthRecord ? currentMonthRecord.monthName : `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`
    };

    res.json({
      student,
      fee,
      currentMonth: currentMonthRecord,
      previousPendingDues,
      previousUnpaidMonths,
      totalPendingBalance,
      totalBilledAllTime: totalBilled,
      totalPaidAllTime: totalPaid,
      monthlyBreakdown,
      payments: sortedPayments
    });
  } catch (error) {
    console.error('getStudentFeeDetails error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update student monthly fee rate / settings
// @route   PUT /api/fees/:studentId
// @access  Private/Admin
const updateStudentFee = async (req, res) => {
  const { monthlyFee, totalFees, dueDate, paymentFrequency, feeDueDay, updateCurrentMonth } = req.body;

  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const newRate = Number(monthlyFee || totalFees);
    if (!isNaN(newRate) && newRate > 0) {
      student.monthlyFee = newRate;
    }
    if (feeDueDay !== undefined && !isNaN(feeDueDay)) {
      student.feeDueDay = Math.min(28, Math.max(1, Number(feeDueDay)));
    }
    await student.save();

    // If updateCurrentMonth is true or new rate provided, update the active month's fee
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentRecord = await MonthlyFee.findOne({ studentId: student._id, monthYear: currentMonthYear });
    if (currentRecord && !isNaN(newRate) && newRate > 0) {
      currentRecord.amount = newRate;
      if (dueDate) currentRecord.dueDate = dueDate;
      await currentRecord.save();
    }

    const syncData = await ensureMonthlyFeesForStudent(student._id);

    res.json({
      message: 'Monthly fee settings updated successfully',
      student,
      syncData
    });
  } catch (error) {
    console.error('updateStudentFee error:', error);
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
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ message: 'Please enter a valid payment amount greater than 0' });
    }

    // 1. Create payment record
    const payment = await Payment.create({
      studentId,
      amount: numAmount,
      paymentMethod: paymentMethod || 'Cash',
      transactionId: transactionId ? transactionId.trim() : '',
      paymentDate: paymentDate || Date.now(),
      notes: notes || ''
    });

    // 2. Redistribute payments across monthly fees FIFO
    const syncData = await ensureMonthlyFeesForStudent(studentId);

    res.status(201).json({
      payment,
      message: `Payment of ₹${numAmount.toLocaleString()} recorded and allocated successfully!`,
      syncData
    });
  } catch (error) {
    console.error('recordPayment error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/fees/all-payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate('studentId', 'name surname studentId roomNumber phone photo')
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

    const studentId = payment.studentId;
    await payment.deleteOne();

    // Re-distribute payments for student
    await ensureMonthlyFeesForStudent(studentId);

    res.json({ message: 'Payment deleted and monthly fee balance recalculated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students with monthly fees and previous pending dues for the fee management table
// @route   GET /api/fees/student-fees
// @access  Private/Admin
const getAllStudentFees = async (req, res) => {
  try {
    await ensureMonthlyFeesForAllStudents();

    const students = await Student.find({ status: { $ne: 'Left' } })
      .select('studentId name surname fatherName phone roomNumber course year status deposit monthlyFee feeDueDay photo');

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthYear = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

    const allMonthlyFees = await MonthlyFee.find({});
    
    // Group monthly fees by studentId
    const feesByStudent = {};
    allMonthlyFees.forEach(mf => {
      const sId = mf.studentId.toString();
      if (!feesByStudent[sId]) feesByStudent[sId] = [];
      feesByStudent[sId].push(mf);
    });

    const result = students.map(s => {
      const studentIdStr = s._id.toString();
      const mfs = feesByStudent[studentIdStr] || [];

      const currentMonthRecord = mfs.find(mf => mf.monthYear === currentMonthYear) || null;
      const currentMonthFee = currentMonthRecord ? currentMonthRecord.amount : (s.monthlyFee || 6000);
      const currentMonthPaid = currentMonthRecord ? currentMonthRecord.paidAmount : 0;
      const currentMonthRemaining = currentMonthRecord ? Math.max(0, currentMonthRecord.amount - currentMonthRecord.paidAmount) : currentMonthFee;

      const previousUnpaid = mfs
        .filter(mf => mf.monthYear < currentMonthYear && (mf.amount - mf.paidAmount) > 0)
        .reduce((sum, mf) => sum + Math.max(0, mf.amount - mf.paidAmount), 0);

      const totalPending = previousUnpaid + currentMonthRemaining;
      const totalPaid = mfs.reduce((sum, mf) => sum + (mf.paidAmount || 0), 0);
      const totalBilled = mfs.reduce((sum, mf) => sum + (mf.amount || 0), 0);

      let status = 'PENDING';
      if (totalPending === 0 && totalBilled > 0) {
        status = 'FULLY PAID';
      } else if (totalPaid > 0) {
        status = 'PARTIALLY PAID';
      }

      return {
        student: s,
        currentMonth: currentMonthRecord || {
          monthYear: currentMonthYear,
          monthName: `${MONTH_NAMES[currentMonth - 1]} ${currentYear}`,
          amount: currentMonthFee,
          paidAmount: currentMonthPaid,
          remainingAmount: currentMonthRemaining,
          status: currentMonthRecord?.status || 'PENDING',
          dueDate: currentMonthRecord?.dueDate || null
        },
        previousPendingDues: previousUnpaid,
        totalPendingBalance: totalPending,
        totalPaid,
        totalBilled,
        fee: {
          totalFees: totalBilled,
          paidAmount: totalPaid,
          remainingAmount: totalPending,
          currentMonthFee,
          currentMonthRemaining,
          previousPendingDues: previousUnpaid,
          status,
          dueDate: currentMonthRecord?.dueDate || null
        }
      };
    });

    res.json(result);
  } catch (error) {
    console.error('getAllStudentFees error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk trigger auto-renewal of monthly fees for all students
// @route   POST /api/fees/auto-renew
// @access  Private/Admin
const autoRenewAllFees = async (req, res) => {
  try {
    const result = await ensureMonthlyFeesForAllStudents();
    res.json({
      message: `Monthly fees successfully auto-renewed for ${result.updatedStudentsCount} students for ${result.currentMonthName}!`,
      currentMonthName: result.currentMonthName,
      updatedCount: result.updatedStudentsCount
    });
  } catch (error) {
    console.error('autoRenewAllFees error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update monthly fee rate for selected students
// @route   PUT /api/fees/bulk-update
// @access  Private/Admin
const bulkUpdateStudentFees = async (req, res) => {
  try {
    const { studentIds, monthlyFee, totalFees, feeDueDay } = req.body;
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one student' });
    }
    const newRate = Number(monthlyFee || totalFees);
    if (isNaN(newRate) || newRate <= 0) {
      return res.status(400).json({ message: 'Valid monthly fee amount is required' });
    }

    let count = 0;
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    for (const id of studentIds) {
      const student = await Student.findById(id);
      if (student) {
        student.monthlyFee = newRate;
        if (feeDueDay) student.feeDueDay = Math.min(28, Math.max(1, Number(feeDueDay)));
        await student.save();

        // Update active month
        const currentRecord = await MonthlyFee.findOne({ studentId: id, monthYear: currentMonthYear });
        if (currentRecord) {
          currentRecord.amount = newRate;
          await currentRecord.save();
        }

        await ensureMonthlyFeesForStudent(id);
        count++;
      }
    }

    res.json({ message: `Updated monthly fee rate (₹${newRate.toLocaleString()}/mo) for ${count} student(s) successfully!`, updatedCount: count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a specific monthly fee record (e.g. adjust discount or due date)
// @route   PUT /api/fees/monthly-records/:id
// @access  Private/Admin
const updateMonthlyFeeRecord = async (req, res) => {
  try {
    const { amount, dueDate, notes } = req.body;
    const record = await MonthlyFee.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ message: 'Monthly fee record not found' });
    }

    if (amount !== undefined && !isNaN(amount) && Number(amount) >= 0) {
      record.amount = Number(amount);
    }
    if (dueDate !== undefined) {
      record.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (notes !== undefined) {
      record.notes = notes;
    }

    await record.save();

    // Re-distribute payments
    await ensureMonthlyFeesForStudent(record.studentId);

    res.json({ message: 'Monthly fee record updated successfully', record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  ensureMonthlyFeesForStudent,
  ensureMonthlyFeesForAllStudents,
  getStudentFeeDetails,
  updateStudentFee,
  recordPayment,
  getAllPayments,
  deletePayment,
  getAllStudentFees,
  autoRenewAllFees,
  bulkUpdateStudentFees,
  updateMonthlyFeeRecord
};
