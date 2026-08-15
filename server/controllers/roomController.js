const Room = require('../models/Room');
const Student = require('../models/Student');

// @desc    Get all rooms with current occupancy
// @route   GET /api/rooms
// @access  Private/Admin
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({}).sort({ roomNumber: 1 });
    
    // Calculate occupancy for each room
    const roomsWithOccupancy = await Promise.all(rooms.map(async (room) => {
      const occupants = await Student.find({ roomNumber: room.roomNumber }).select('name surname phone studentId');
      return {
        ...room.toObject(),
        currentOccupants: occupants.length,
        occupantDetails: occupants
      };
    }));

    res.json(roomsWithOccupancy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new room
// @route   POST /api/rooms
// @access  Private/Admin
const addRoom = async (req, res) => {
  const { roomNumber, capacity, floor, facilities } = req.body;

  try {
    const roomExists = await Room.findOne({ roomNumber });

    if (roomExists) {
      return res.status(400).json({ message: 'Room already exists' });
    }

    const room = await Room.create({
      roomNumber,
      capacity,
      floor,
      facilities
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if room is occupied
    const occupants = await Student.countDocuments({ roomNumber: room.roomNumber });
    if (occupants > 0) {
      return res.status(400).json({ message: 'Cannot delete an occupied room' });
    }

    await room.deleteOne();
    res.json({ message: 'Room removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRooms, addRoom, deleteRoom };
