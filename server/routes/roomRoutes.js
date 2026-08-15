const express = require('express');
const router = express.Router();
const { getRooms, addRoom, deleteRoom } = require('../controllers/roomController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, admin, getRooms)
  .post(protect, admin, addRoom);

router.route('/:id')
  .delete(protect, admin, deleteRoom);

module.exports = router;
