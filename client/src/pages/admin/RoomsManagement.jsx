import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Home, Users, Building, X, Search } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const RoomsManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'available', 'full'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({ roomNumber: '', capacity: 2, floor: 1 });
  const [isOccupantsModalOpen, setIsOccupantsModalOpen] = useState(false);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', newRoom);
      setIsAddModalOpen(false);
      setNewRoom({ roomNumber: '', capacity: 2, floor: 1 });
      fetchRooms(); // Refresh the list
    } catch (error) {
      console.error('Failed to add room:', error);
      alert(error.response?.data?.message || 'Failed to add room');
    }
  };

  const handleDeleteRoom = async (id, roomNumber, currentOccupants) => {
    if (currentOccupants > 0) {
      alert(`Cannot delete Room ${roomNumber} because it is currently occupied by ${currentOccupants} student(s).`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete Room ${roomNumber}?`)) {
      try {
        await api.delete(`/rooms/${id}`);
        fetchRooms();
      } catch (error) {
        console.error('Failed to delete room:', error);
        alert(error.response?.data?.message || 'Failed to delete room');
      }
    }
  };

  const handleRoomClick = (room) => {
    setSelectedRoomDetails(room);
    setIsOccupantsModalOpen(true);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const availableRoomsCount = rooms.filter(r => r.currentOccupants < r.capacity).length;
  const fullRoomsCount = rooms.filter(r => r.currentOccupants >= r.capacity).length;

  const filteredRooms = rooms.filter(room => {
    const isFull = room.currentOccupants >= room.capacity;
    if (filterStatus === 'available' && isFull) return false;
    if (filterStatus === 'full' && !isFull) return false;

    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    const roomStr = String(room.roomNumber || '').toLowerCase();
    const capacityStr = String(room.capacity || '').toLowerCase();
    const floorStr = String(room.floor ?? 1).toLowerCase();

    const matchesRoom = roomStr.includes(searchLower) || `room ${roomStr}`.includes(searchLower);
    const matchesCapacity = capacityStr === searchLower || `capacity ${capacityStr}`.includes(searchLower);
    const matchesFloor = floorStr.includes(searchLower) || `floor ${floorStr}`.includes(searchLower);

    return matchesRoom || matchesCapacity || matchesFloor;
  });

  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left Side: Search and Availability Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
            <Input 
              id="searchRoom"
              name="searchRoom"
              placeholder="Search by room, capacity, floor..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg shrink-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'all' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
            >
              All ({rooms.length})
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'available' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
            >
              Available ({availableRoomsCount})
            </button>
            <button
              onClick={() => setFilterStatus('full')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'full' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
            >
              Full ({fullRoomsCount})
            </button>
          </div>
        </div>

        {/* Right Side: Add Room Button */}
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Add Room
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-black/50 dark:text-white/50">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Home className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-4" />
          <h3 className="text-lg font-medium">No Rooms Found</h3>
          <p className="text-black/50 dark:text-white/50 mt-1">Get started by adding your first room.</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Home className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-4" />
          <h3 className="text-lg font-medium">No Rooms Match Your Filter</h3>
          <p className="text-black/50 dark:text-white/50 mt-1">Try searching for a different room or change the availability filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentRooms.map((room, idx) => {
              const isFull = room.currentOccupants >= room.capacity;
              const occupancyPercent = Math.min((room.currentOccupants / room.capacity) * 100, 100);

              return (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card 
                    className="h-full overflow-hidden flex flex-col group relative cursor-pointer hover:border-primary-500/50 transition-colors"
                    onClick={() => handleRoomClick(room)}
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRoom(room._id, room.roomNumber, room.currentOccupants);
                        }}
                        className="p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                        title="Delete Room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <Home className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold tracking-tight">Room {room.roomNumber}</h3>
                          <p className="text-xs text-black/50 dark:text-white/50 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3" /> Floor {room.floor || 1}
                          </p>
                        </div>
                      </div>

                      <div className="mt-auto space-y-4">
                        <div className="flex justify-between items-end">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-black/40 dark:text-white/40" />
                            <span className="text-sm font-medium">
                              {room.currentOccupants} / {room.capacity}
                            </span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            isFull 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {isFull ? 'Full' : 'Available'}
                          </span>
                        </div>

                        <div className="w-full h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${occupancyPercent}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-primary-500'}`}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border mt-6">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="text-sm text-black/60 dark:text-white/60">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Room Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border"
            >
              <div className="flex justify-between items-center p-6 border-b border-border bg-black/5 dark:bg-white/5">
                <h3 className="text-lg font-bold">Add New Room</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddRoom} className="p-6 space-y-4">
                <div>
                  <label htmlFor="roomNumber" className="block text-sm font-medium mb-1">Room Number *</label>
                  <Input 
                    id="roomNumber"
                    name="roomNumber"
                    required 
                    placeholder="e.g. 101, A-202"
                    value={newRoom.roomNumber}
                    onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="capacity" className="block text-sm font-medium mb-1">Capacity *</label>
                    <Input 
                      id="capacity"
                      name="capacity"
                      type="number" 
                      required 
                      min="1"
                      value={newRoom.capacity}
                      onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value) || 1})}
                    />
                  </div>
                  <div>
                    <label htmlFor="floor" className="block text-sm font-medium mb-1">Floor</label>
                    <Input 
                      id="floor"
                      name="floor"
                      type="number"
                      value={newRoom.floor}
                      onChange={(e) => setNewRoom({...newRoom, floor: parseInt(e.target.value) || 1})}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Room
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Occupants Modal */}
      <AnimatePresence>
        {isOccupantsModalOpen && selectedRoomDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsOccupantsModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border"
            >
              <div className="flex justify-between items-center p-6 border-b border-border bg-black/5 dark:bg-white/5">
                <h3 className="text-lg font-bold">Room {selectedRoomDetails.roomNumber} Occupants</h3>
                <button onClick={() => setIsOccupantsModalOpen(false)} className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {selectedRoomDetails.occupantDetails && selectedRoomDetails.occupantDetails.length > 0 ? (
                  <div className="space-y-4">
                    {selectedRoomDetails.occupantDetails.map((student) => (
                      <div key={student._id} className="flex items-center gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                          {student.name ? student.name.charAt(0) : 'U'}
                        </div>
                        <div>
                          <p className="font-semibold leading-none">{student.name} {student.surname}</p>
                          <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                            ID: {student.studentId} {student.phone ? `• Ph: ${student.phone}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-3" />
                    <p className="text-black/50 dark:text-white/50">This room is currently empty.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomsManagement;
