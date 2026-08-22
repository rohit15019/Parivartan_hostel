const Student = require('../models/Student');
const MonthlyFee = require('../models/MonthlyFee');
const Fee = require('../models/Fee');
const Payment = require('../models/Payment');
const LeaveRequest = require('../models/LeaveRequest');
const Report = require('../models/Report');
const { ensureMonthlyFeesForAllStudents } = require('./feeController');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentMonthYear = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Auto-sync monthly fees for all active students
    await ensureMonthlyFeesForAllStudents().catch(() => {});

    const totalStudents = await Student.countDocuments({ status: { $ne: 'Left' } });
    const studentsAway = await Student.countDocuments({ status: 'Away' });

    // Monthly Fee counts for active month
    const allMonthlyFees = await MonthlyFee.find({});
    const currentMonthFees = allMonthlyFees.filter(mf => mf.monthYear === currentMonthYear);

    let fullyPaidCount = 0;
    let halfPaidCount = 0;
    let pendingCount = 0;
    let totalPendingArrears = 0;
    let currentMonthPending = 0;

    // Calculate previous unpaid arrears and current month status
    allMonthlyFees.forEach(mf => {
      const remaining = Math.max(0, (Number(mf.amount) || 0) - (Number(mf.paidAmount) || 0));
      if (mf.monthYear < currentMonthYear) {
        totalPendingArrears += remaining;
      } else if (mf.monthYear === currentMonthYear) {
        currentMonthPending += remaining;
        if (remaining === 0 && Number(mf.amount) > 0) fullyPaidCount++;
        else if (Number(mf.paidAmount) > 0) halfPaidCount++;
        else pendingCount++;
      }
    });

    const totalPendingDues = totalPendingArrears + currentMonthPending;

    // Current Month Payments Collected
    const currentMonthPayments = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    const currentMonthFeesCollected = currentMonthPayments.length > 0 ? currentMonthPayments[0].total : 0;

    // Current Year Payments Collected
    const currentYearPayments = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    const currentYearFeesCollected = currentYearPayments.length > 0 ? currentYearPayments[0].total : 0;

    // All Time Payments
    const allPayments = await Payment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);
    const totalAllTimeFeesCollected = allPayments.length > 0 ? allPayments[0].total : 0;

    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'PENDING' });
    const pendingReports = await Report.countDocuments({ status: 'Pending' });

    const recentPayments = await Payment.find({})
      .populate('studentId', 'name surname roomNumber photo')
      .sort({ paymentDate: -1 })
      .limit(5);

    // Monthly Fee Collection Graph
    const monthlyPayments = await Payment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$paymentDate" },
            month: { $month: "$paymentDate" }
          },
          totalAmount: { $sum: "$amount" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let yearlyGraphData = {};
    let yearlyTotals = {};
    
    monthlyPayments.forEach(p => {
      const year = p._id.year;
      const monthIndex = p._id.month - 1;
      
      if (!yearlyGraphData[year]) {
        yearlyGraphData[year] = monthNames.map(name => ({ month: name, amount: 0 }));
        yearlyTotals[year] = 0;
      }
      
      yearlyGraphData[year][monthIndex].amount = p.totalAmount;
      yearlyTotals[year] = (yearlyTotals[year] || 0) + p.totalAmount;
    });

    if (!yearlyGraphData[currentYear]) {
      yearlyGraphData[currentYear] = monthNames.map(name => ({ month: name, amount: 0 }));
      yearlyTotals[currentYear] = 0;
    }

    res.json({
      stats: {
        totalStudents,
        studentsAway,
        currentYear,
        currentMonthName: `${monthNames[currentMonth - 1]} ${currentYear}`,
        currentMonthYear,
        totalFeesCollected: currentYearFeesCollected,
        currentMonthFeesCollected,
        currentYearFeesCollected,
        totalAllTimeFeesCollected,
        totalPendingDues,
        totalPendingArrears,
        currentMonthPending,
        yearlyTotals,
        fullyPaidCount,
        halfPaidCount,
        pendingCount,
        pendingLeaves,
        pendingReports
      },
      recentPayments,
      yearlyGraphData,
      yearlyTotals
    });
  } catch (error) {
    console.error('getAdminDashboardStats error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboardStats };
