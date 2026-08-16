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

    // Fee Collection Overview - Last 6 Months
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    const monthlyPayments = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$paymentDate" },
            month: { $month: "$paymentDate" }
          },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let feeGraphData = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth() + 1; // 1-12
      
      const found = monthlyPayments.find(p => p._id.year === year && p._id.month === month);
      
      feeGraphData.push({
        month: monthNames[d.getMonth()],
        amount: found ? found.totalAmount : 0
      });
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
      feeGraphData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAdminDashboardStats };
