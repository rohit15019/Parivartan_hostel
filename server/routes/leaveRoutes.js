const express = require('express');
const router = express.Router();
const { getLeaveRequests, getMyLeaveRequests, submitLeaveRequest, updateLeaveStatus } = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getLeaveRequests)
  .post(protect, submitLeaveRequest);

router.route('/my')
  .get(protect, getMyLeaveRequests);

router.route('/:id/status')
  .put(protect, admin, updateLeaveStatus);

router.route('/:id')
  .delete(protect, require('../controllers/leaveController').deleteLeaveRequest);

module.exports = router;
