const Student = require('../models/Student');
const Fee = require('../models/Fee');
const Payment = require('../models/Payment');
const LeaveRequest = require('../models/LeaveRequest');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({});
    const studentsAway = await Student.countDocuments({ status: 'Away' });
    
    const fees = await Fee.find({});
    
    let totalFeesCollected = 0;
    let fullyPaidCount = 0;
    let halfPaidCount = 0;
    let pendingCount = 0;

    fees.forEach(fee => {
      const paid = fee.paidAmount || 0;
      const total = fee.totalFees || 0;
      totalFeesCollected += paid;
      if (paid === 0) pendingCount++;
      else if (paid >= total) fullyPaidCount++;
      else halfPaidCount++;
    });

    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'PENDING' });
    const Report = require('../models/Report');
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
    
    monthlyPayments.forEach(p => {
      const year = p._id.year;
      const monthIndex = p._id.month - 1;
      
      if (!yearlyGraphData[year]) {
        yearlyGraphData[year] = monthNames.map(name => ({ month: name, amount: 0 }));
      }
      
      yearlyGraphData[year][monthIndex].amount = p.totalAmount;
    });

    // If no payments exist, fallback to current year
    if (Object.keys(yearlyGraphData).length === 0) {
      const currentYear = new Date().getFullYear();
      yearlyGraphData[currentYear] = monthNames.map(name => ({ month: name, amount: 0 }));
    }

    res.json({
      stats: {
        totalStudents,
        studentsAway,
        totalFeesCollected,
        fullyPaidCount,
        halfPaidCount,
        pendingCount,
        pendingLeaves,
        pendingReports
      },
      recentPayments,
      yearlyGraphData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboardStats };
