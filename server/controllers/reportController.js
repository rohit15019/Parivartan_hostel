const Report = require('../models/Report');
const Student = require('../models/Student');

// @desc    Create new report
// @route   POST /api/reports
// @access  Private/Student
const createReport = async (req, res) => {
  const { title, description } = req.body;

  try {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const report = await Report.create({
      studentId: student._id,
      title,
      description
    });

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reports for logged in student
// @route   GET /api/reports/my
// @access  Private/Student
const getMyReports = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const reports = await Report.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private/Admin
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('studentId', 'name surname studentId roomNumber')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update report status (Admin)
// @route   PUT /api/reports/:id
// @access  Private/Admin
const updateReport = async (req, res) => {
  const { status, adminNotes } = req.body;

  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;

    const updatedReport = await report.save();
    
    const populatedReport = await Report.findById(updatedReport._id).populate('studentId', 'name surname studentId roomNumber');
    
    res.json(populatedReport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a report (Admin)
// @route   DELETE /api/reports/:id
// @access  Private/Admin
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReport,
  getMyReports,
  getAllReports,
  updateReport,
  deleteReport
};
