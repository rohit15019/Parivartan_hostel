const LeaveRequest = require('../models/LeaveRequest');
const Student = require('../models/Student');

// @desc    Get all leave requests (Admin)
// @route   GET /api/leaves
// @access  Private/Admin
const getLeaveRequests = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({})
      .populate('studentId', 'name studentId roomNumber')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my leave requests (Student)
// @route   GET /api/leaves/my
// @access  Private/Student
const getMyLeaveRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const leaves = await LeaveRequest.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a leave request
// @route   POST /api/leaves
// @access  Private/Student
const submitLeaveRequest = async (req, res) => {
  const { leaveType, fromDate, toDate, days, reason, parentPhone } = req.body;

  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ message: 'Student profile not found' });

    const leave = await LeaveRequest.create({
      studentId: student._id,
      leaveType,
      fromDate,
      toDate,
      days,
      reason,
      parentPhone: parentPhone || student.parentPhone
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update leave request status
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin
const updateLeaveStatus = async (req, res) => {
  const { status, adminComment } = req.body;

  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (leave) {
      leave.status = status;
      if (adminComment !== undefined) leave.adminComment = adminComment;
      
      const updatedLeave = await leave.save();
      res.json(updatedLeave);
    } else {
      res.status(404).json({ message: 'Leave request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a leave request
// @route   DELETE /api/leaves/:id
// @access  Private/Student
const deleteLeaveRequest = async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Verify it belongs to the requesting student
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || leave.studentId.toString() !== student._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this request' });
    }

    // Only allow deletion if status is PENDING
    if (leave.status !== 'PENDING') {
      return res.status(400).json({ message: 'Cannot delete processed leave request' });
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave request removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaveRequests, getMyLeaveRequests, submitLeaveRequest, updateLeaveStatus, deleteLeaveRequest };
