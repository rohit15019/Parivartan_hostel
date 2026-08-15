const express = require('express');
const router = express.Router();
const { getStudents, getStudentProfile, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getStudents)
  .post(protect, admin, createStudent);

router.route('/:id')
  .put(protect, admin, updateStudent)
  .delete(protect, admin, deleteStudent);

router.route('/profile')
  .get(protect, getStudentProfile);

module.exports = router;
