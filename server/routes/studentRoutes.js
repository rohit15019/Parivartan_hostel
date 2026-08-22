const express = require('express');
const router = express.Router();
const { getStudents, getStudentProfile, uploadStudentPhoto, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/profile')
  .get(protect, getStudentProfile);

router.route('/profile/photo')
  .put(protect, uploadStudentPhoto);

router.route('/')
  .get(protect, admin, getStudents)
  .post(protect, admin, createStudent);

router.route('/:id')
  .put(protect, admin, updateStudent)
  .delete(protect, admin, deleteStudent);

module.exports = router;
