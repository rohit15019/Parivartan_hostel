const LibrarySeat = require('../models/LibrarySeat');
const Student = require('../models/Student');
const Fee = require('../models/Fee');

// @desc    Get all library seats with student details
// @route   GET /api/library/seats
// @access  Private/Admin
const getLibrarySeats = async (req, res) => {
  try {
    const seats = await LibrarySeat.find({})
      .populate('studentId', 'name surname studentId phone roomNumber photo')
      .collation({ locale: 'en', numericOrdering: true })
      .sort({ seatNumber: 1 });

    // Ensure natural alphanumeric sort (Seat 1, 2 ... 9, 10, 11)
    const sortedSeats = seats.map(s => s.toObject()).sort((a, b) => 
      String(a.seatNumber).localeCompare(String(b.seatNumber), undefined, { numeric: true, sensitivity: 'base' })
    );

    res.json(sortedSeats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a library seat or batch add seats
// @route   POST /api/library/seats
// @access  Private/Admin
const addLibrarySeat = async (req, res) => {
  try {
    const { isBatch, seatNumber, prefix = 'Seat-', startNum, endNum, section = 'Main Hall', floor = 1, notes } = req.body;

    if (isBatch) {
      const start = parseInt(startNum, 10);
      const end = parseInt(endNum, 10);

      if (isNaN(start) || isNaN(end) || start > end) {
        return res.status(400).json({ message: 'Invalid range for batch seat generation' });
      }

      if (end - start > 100) {
        return res.status(400).json({ message: 'Cannot create more than 100 seats in one batch' });
      }

      const createdSeats = [];
      const skippedSeats = [];

      for (let i = start; i <= end; i++) {
        const generatedNumber = `${prefix ? prefix.trim() : ''}${i}`;
        const existing = await LibrarySeat.findOne({ seatNumber: generatedNumber });
        if (!existing) {
          const seat = await LibrarySeat.create({
            seatNumber: generatedNumber,
            section: section.trim() || 'Main Hall',
            floor: parseInt(floor, 10) || 1,
            notes: notes || ''
          });
          createdSeats.push(seat);
        } else {
          skippedSeats.push(generatedNumber);
        }
      }

      return res.status(201).json({
        message: `Created ${createdSeats.length} seat(s). ${skippedSeats.length > 0 ? `Skipped ${skippedSeats.length} already existing seats.` : ''}`,
        createdCount: createdSeats.length,
        skippedCount: skippedSeats.length
      });
    }

    // Single Seat Creation
    if (!seatNumber || !seatNumber.trim()) {
      return res.status(400).json({ message: 'Seat number is required' });
    }

    const trimmedSeat = seatNumber.trim();
    const existing = await LibrarySeat.findOne({ seatNumber: trimmedSeat });
    if (existing) {
      return res.status(400).json({ message: `Seat ${trimmedSeat} already exists` });
    }

    const newSeat = await LibrarySeat.create({
      seatNumber: trimmedSeat,
      section: section.trim() || 'Main Hall',
      floor: parseInt(floor, 10) || 1,
      notes: notes || ''
    });

    res.status(201).json(newSeat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign student to library seat
// @route   PUT /api/library/seats/:id/assign
// @access  Private/Admin
const assignLibrarySeat = async (req, res) => {
  try {
    const { studentId, feePaid = true, notes } = req.body;

    const seat = await LibrarySeat.findById(req.params.id);
    if (!seat) {
      return res.status(404).json({ message: 'Library seat not found' });
    }

    if (!studentId) {
      return res.status(400).json({ message: 'Please select a student to assign' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if student is already assigned to another library seat
    const alreadyAssigned = await LibrarySeat.findOne({ 
      studentId, 
      _id: { $ne: seat._id } 
    });

    if (alreadyAssigned) {
      const studentName = `${student.name} ${student.surname || ''}`.trim();
      return res.status(400).json({ 
        message: `${studentName} is already assigned to Seat ${alreadyAssigned.seatNumber}. A student cannot hold more than one library seat. Please vacate Seat ${alreadyAssigned.seatNumber} first.`
      });
    }

    seat.studentId = studentId;
    seat.assignedDate = new Date();
    seat.feePaid = feePaid === true || feePaid === 'true';
    if (notes !== undefined) seat.notes = notes;

    await seat.save();

    const populatedSeat = await LibrarySeat.findById(seat._id)
      .populate('studentId', 'name surname studentId phone roomNumber');

    res.json({
      message: `Assigned seat ${seat.seatNumber} to ${student.name} ${student.surname || ''}`,
      seat: populatedSeat
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Vacate / Remove student from library seat
// @route   PUT /api/library/seats/:id/vacate
// @access  Private/Admin
const vacateLibrarySeat = async (req, res) => {
  try {
    const seat = await LibrarySeat.findById(req.params.id);
    if (!seat) {
      return res.status(404).json({ message: 'Library seat not found' });
    }

    seat.studentId = null;
    seat.assignedDate = null;
    seat.notes = '';

    await seat.save();

    res.json({ message: `Seat ${seat.seatNumber} vacated successfully`, seat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a library seat
// @route   DELETE /api/library/seats/:id
// @access  Private/Admin
const deleteLibrarySeat = async (req, res) => {
  try {
    const seat = await LibrarySeat.findById(req.params.id);
    if (!seat) {
      return res.status(404).json({ message: 'Library seat not found' });
    }

    // Check if seat is currently occupied
    if (seat.studentId) {
      return res.status(400).json({ 
        message: `Cannot delete Seat ${seat.seatNumber} because it is currently occupied. Please vacate the seat first.` 
      });
    }

    await seat.deleteOne();
    res.json({ message: `Seat ${seat.seatNumber} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get students for assignment with fee status and seat info
// @route   GET /api/library/students
// @access  Private/Admin
const getStudentsForLibrary = async (req, res) => {
  try {
    const students = await Student.find({ status: { $ne: 'Left' } })
      .select('name surname studentId phone roomNumber status');

    const assignedSeats = await LibrarySeat.find({ studentId: { $ne: null } })
      .select('seatNumber studentId');

    const assignedMap = {};
    assignedSeats.forEach(s => {
      if (s.studentId) {
        assignedMap[s.studentId.toString()] = s.seatNumber;
      }
    });

    const fees = await Fee.find({});
    const feeMap = {};
    fees.forEach(f => {
      feeMap[f.studentId.toString()] = {
        totalFees: f.totalFees || 0,
        paidAmount: f.paidAmount || 0,
        status: (f.paidAmount || 0) >= (f.totalFees || 0) && f.totalFees > 0 
          ? 'PAID' 
          : (f.paidAmount || 0) > 0 
            ? 'PARTIALLY PAID' 
            : 'PENDING'
      };
    });

    const studentsWithInfo = students.map(s => {
      const sId = s._id.toString();
      return {
        ...s.toObject(),
        assignedSeat: assignedMap[sId] || null,
        feeInfo: feeMap[sId] || { totalFees: 0, paidAmount: 0, status: 'PENDING' }
      };
    });

    res.json(studentsWithInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's own library seat and library overview
// @route   GET /api/library/my-seat
// @access  Private/Student
const getMyLibrarySeat = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    let assignedSeat = null;

    if (student) {
      assignedSeat = await LibrarySeat.findOne({ studentId: student._id });
    }

    const totalSeats = await LibrarySeat.countDocuments({});
    const occupiedSeats = await LibrarySeat.countDocuments({ studentId: { $ne: null } });
    const availableSeats = Math.max(0, totalSeats - occupiedSeats);

    const allSeats = await LibrarySeat.find({})
      .select('seatNumber section floor studentId assignedDate notes');

    // Natural sort alphanumeric seat numbers
    const formattedSeats = allSeats
      .map(s => {
        const isMySeat = student && s.studentId ? s.studentId.toString() === student._id.toString() : false;
        return {
          _id: s._id,
          seatNumber: s.seatNumber,
          section: s.section || 'Main Hall',
          floor: s.floor || 1,
          isOccupied: Boolean(s.studentId),
          isMySeat,
          assignedDate: s.assignedDate,
          notes: isMySeat ? s.notes : ''
        };
      })
      .sort((a, b) =>
        String(a.seatNumber).localeCompare(String(b.seatNumber), undefined, { numeric: true, sensitivity: 'base' })
      );

    res.json({
      student,
      assignedSeat,
      stats: {
        totalSeats,
        occupiedSeats,
        availableSeats
      },
      seats: formattedSeats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLibrarySeats,
  addLibrarySeat,
  assignLibrarySeat,
  vacateLibrarySeat,
  deleteLibrarySeat,
  getStudentsForLibrary,
  getMyLibrarySeat
};
