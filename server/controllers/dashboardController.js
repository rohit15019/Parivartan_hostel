const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Payment = require('../models/Payment');
const LeaveRequest = require('../models/LeaveRequest');
const Report = require('../models/Report');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const totalStudents = await Student.countDocuments({});
    const studentsAway = await Student.countDocuments({ status: 'Away' });
    
    const fees = await Fee.find({});
    
    let totalAllTimeFeesCollected = 0;
    let fullyPaidCount = 0;
    let halfPaidCount = 0;
    let pendingCount = 0;

    fees.forEach(fee => {
      const paid = fee.paidAmount || 0;
      const total = fee.totalFees || 0;
      totalAllTimeFeesCollected += paid;
      if (paid === 0) pendingCount++;
      else if (paid >= total) fullyPaidCount++;
      else halfPaidCount++;
    });

    // Current Year Fees Collected (resets to 0 every new year on Jan 1st)
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

    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'PENDING' });
    const pendingReports = await Report.countDocuments({ status: 'Pending' });

    const recentPayments = await Payment.find({})
      .populate('studentId', 'name roomNumber')
      .sort({ paymentDate: -1 })
      .limit(5);

    // Fee Collection Overview - Group by Year and Month
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

    // If no payments exist for current year, initialize it
    if (!yearlyGraphData[currentYear]) {
      yearlyGraphData[currentYear] = monthNames.map(name => ({ month: name, amount: 0 }));
      yearlyTotals[currentYear] = 0;
    }

    res.json({
      stats: {
        totalStudents,
        studentsAway,
        currentYear,
        totalFeesCollected: currentYearFeesCollected, // Resets every new year
        currentYearFeesCollected,
        totalAllTimeFeesCollected,
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
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboardStats };
