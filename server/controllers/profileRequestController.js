const ProfileRequest = require('../models/ProfileRequest');
const Student = require('../models/Student');

// @desc    Create a new profile change request
// @route   POST /api/profile-requests
// @access  Private (Student)
exports.createRequest = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { requestText } = req.body;
    if (!requestText) {
      return res.status(400).json({ message: 'Request text is required' });
    }

    const request = await ProfileRequest.create({
      studentId: student._id,
      requestText,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in student's profile requests
// @route   GET /api/profile-requests/my
// @access  Private (Student)
exports.getMyRequests = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const requests = await ProfileRequest.find({ studentId: student._id }).sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all profile change requests
// @route   GET /api/profile-requests
// @access  Private (Admin)
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ProfileRequest.find()
      .populate('studentId', 'name surname studentId roomNumber')
      .sort('-createdAt');
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/profile-requests/:id
// @access  Private (Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const request = await ProfileRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    request.status = status || request.status;
    request.adminNotes = adminNotes !== undefined ? adminNotes : request.adminNotes;
    
    const updatedRequest = await request.save();
    
    // Repopulate for frontend
    await updatedRequest.populate('studentId', 'name surname studentId roomNumber');
    
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
