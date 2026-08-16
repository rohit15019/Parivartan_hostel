const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  createReport,
  getMyReports,
  getAllReports,
  updateReport,
  deleteReport
} = require('../controllers/reportController');

router.route('/')
  .post(protect, createReport)
  .get(protect, admin, getAllReports);

router.route('/my').get(protect, getMyReports);

router.route('/:id')
  .put(protect, admin, updateReport)
  .delete(protect, admin, deleteReport);

module.exports = router;
