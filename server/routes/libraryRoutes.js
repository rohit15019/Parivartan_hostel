const express = require('express');
const router = express.Router();
const {
  getLibrarySeats,
  addLibrarySeat,
  assignLibrarySeat,
  vacateLibrarySeat,
  deleteLibrarySeat,
  getStudentsForLibrary,
  getMyLibrarySeat
} = require('../controllers/libraryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/my-seat')
  .get(protect, getMyLibrarySeat);

router.route('/seats')
  .get(protect, admin, getLibrarySeats)
  .post(protect, admin, addLibrarySeat);

router.route('/seats/:id')
  .delete(protect, admin, deleteLibrarySeat);

router.route('/seats/:id/assign')
  .put(protect, admin, assignLibrarySeat);

router.route('/seats/:id/vacate')
  .put(protect, admin, vacateLibrarySeat);

router.route('/students')
  .get(protect, admin, getStudentsForLibrary);

module.exports = router;
