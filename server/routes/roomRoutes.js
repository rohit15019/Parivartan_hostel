const express = require('express');
const router = express.Router();
const { getRooms, addRoom, deleteRoom, removeStudentFromRoom } = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getRooms)
  .post(protect, admin, addRoom);

router.route('/remove-student')
  .put(protect, admin, removeStudentFromRoom);

router.route('/:id')
  .delete(protect, admin, deleteRoom);

module.exports = router;
