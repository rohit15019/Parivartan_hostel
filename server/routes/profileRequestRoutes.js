const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus
} = require('../controllers/profileRequestController');

router.route('/')
  .post(protect, createRequest)
  .get(protect, admin, getAllRequests);

router.route('/my').get(protect, getMyRequests);

router.route('/:id')
  .put(protect, admin, updateRequestStatus);

module.exports = router;
