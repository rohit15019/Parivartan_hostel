import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  UserPlus, 
  UserMinus, 
  Check, 
  Calendar, 
  Building, 
  CreditCard,
  Layers,
  Sparkles
} from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

const LibraryManagement = () => {
  const [seats, setSeats] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'available', 'occupied'
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState('single'); // 'single' or 'batch'
  const [newSeat, setNewSeat] = useState({ seatNumber: '', section: 'Main Hall', floor: 1, notes: '' });
  const [batchData, setBatchData] = useState({ prefix: 'L-', startNum: 1, endNum: 10, section: 'Main Hall', floor: 1 });

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [feePaid, setFeePaid] = useState(true);
  const [assignNotes, setAssignNotes] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Pagination (8 seats per page)
  const [currentPage, setCurrentPage] = useState(1);
  const seatsPerPage = 8;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [seatsRes, studentsRes] = await Promise.all([
        api.get('/library/seats'),
        api.get('/library/students')
      ]);
      setSeats(seatsRes.data || []);
      setStudents(studentsRes.data || []);
    } catch (error) {
      console.error('Failed to load library data', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSeats = async () => {
    try {
      const { data } = await api.get('/library/seats');
      setSeats(data || []);
      return data;
    } catch (error) {
      console.error('Failed to refresh seats', error);
    }
  };

  const refreshStudents = async () => {
    try {
      const { data } = await api.get('/library/students');
      setStudents(data || []);
    } catch (error) {
      console.error('Failed to refresh students', error);
    }
  };

  // Add Seat
  const handleAddSeat = async (e) => {
    e.preventDefault();
    try {
      if (addMode === 'batch') {
        const payload = {
          isBatch: true,
          prefix: batchData.prefix,
          startNum: parseInt(batchData.startNum, 10),
          endNum: parseInt(batchData.endNum, 10),
          section: batchData.section,
          floor: parseInt(batchData.floor, 10)
        };
        const res = await api.post('/library/seats', payload);
        alert(res.data.message || 'Batch seats created successfully');
      } else {
        await api.post('/library/seats', newSeat);
      }

      setIsAddModalOpen(false);
      setNewSeat({ seatNumber: '', section: 'Main Hall', floor: 1, notes: '' });
      const updated = await refreshSeats();
      
      // Navigate to the last page so new seats are visible
      if (updated && updated.length > 0) {
        const newTotalPages = Math.ceil(updated.length / seatsPerPage);
        setCurrentPage(newTotalPages > 0 ? newTotalPages : 1);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add seat');
    }
  };

  // Delete Seat (Only allowed when vacant)
  const handleDeleteSeat = async (id, seatNumber, isOccupied) => {
    if (isOccupied) {
      alert(`Cannot delete Seat ${seatNumber} because it is currently occupied by a student. Please vacate the seat first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete Seat ${seatNumber}?`)) {
      try {
        await api.delete(`/library/seats/${id}`);
        await refreshSeats();
        await refreshStudents();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete seat');
      }
    }
  };

  // Open Assign Modal
  const handleOpenAssign = (seat) => {
    setSelectedSeat(seat);
    setSelectedStudentId('');
    setStudentSearch('');
    setFeePaid(true);
    setAssignNotes('');
    setIsAssignModalOpen(true);
  };

  // Assign Student to Seat
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Please select a student to assign');
      return;
    }

    const studentObj = students.find(s => s._id === selectedStudentId);
    if (studentObj && studentObj.assignedSeat && studentObj.assignedSeat !== selectedSeat.seatNumber) {
      alert(`Cannot assign ${studentObj.name} because they are already occupying Seat ${studentObj.assignedSeat}. A student cannot hold multiple library seats. Please vacate Seat ${studentObj.assignedSeat} first.`);
      return;
    }

    setAssigning(true);
    try {
      await api.put(`/library/seats/${selectedSeat._id}/assign`, {
        studentId: selectedStudentId,
        feePaid,
        notes: assignNotes
      });

      setIsAssignModalOpen(false);
      setSelectedSeat(null);
      await refreshSeats();
      await refreshStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign seat');
    } finally {
      setAssigning(false);
    }
  };

  // Vacate / Remove Student from Seat
  const handleVacateSeat = async (seat) => {
    const studentName = seat.studentId 
      ? `${seat.studentId.name} ${seat.studentId.surname || ''}` 
      : 'the assigned student';

    if (!window.confirm(`Remove ${studentName} from Seat ${seat.seatNumber}? The seat will become available.`)) {
      return;
    }

    try {
      await api.put(`/library/seats/${seat._id}/vacate`);
      await refreshSeats();
      await refreshStudents();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to vacate seat');
    }
  };

  // Stats calculation
  const totalSeats = seats.length;
  const occupiedSeats = seats.filter(s => s.studentId).length;
  const availableSeats = totalSeats - occupiedSeats;
  const occupancyRate = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

  // Filter & Search logic
  const filteredSeats = seats.filter(seat => {
    const isOccupied = !!seat.studentId;
    if (filterStatus === 'available' && isOccupied) return false;
    if (filterStatus === 'occupied' && !isOccupied) return false;

    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    const seatNum = String(seat.seatNumber || '').toLowerCase();
    const section = String(seat.section || '').toLowerCase();
    const studentName = seat.studentId ? `${seat.studentId.name || ''} ${seat.studentId.surname || ''}`.toLowerCase() : '';
    const studentId = seat.studentId?.studentId ? String(seat.studentId.studentId).toLowerCase() : '';
    const room = seat.studentId?.roomNumber ? String(seat.studentId.roomNumber).toLowerCase() : '';

    return seatNum.includes(searchLower) ||
      section.includes(searchLower) ||
      studentName.includes(searchLower) ||
      studentId.includes(searchLower) ||
      room.includes(searchLower);
  });

  // Reset page when search or tab filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Pagination slicing
  const totalPages = Math.ceil(filteredSeats.length / seatsPerPage);
  const indexOfLastSeat = currentPage * seatsPerPage;
  const indexOfFirstSeat = indexOfLastSeat - seatsPerPage;
  const currentSeats = filteredSeats.slice(indexOfFirstSeat, indexOfLastSeat);

  // Auto-adjust page if current page exceeds total pages after deleting items
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Filtered students for assign modal
  const filteredStudents = students.filter(student => {
    if (!studentSearch) return true;
    const s = studentSearch.toLowerCase().trim();
    const fullName = `${student.name || ''} ${student.surname || ''}`.toLowerCase();
    const id = (student.studentId || '').toLowerCase();
    const room = (student.roomNumber || '').toLowerCase();
    return fullName.includes(s) || id.includes(s) || room.includes(s);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-primary-500" /> Library Seat Management
          </h1>
          <p className="text-black/60 dark:text-white/60 text-sm">
            Manage library seating allocation, assign seats to paid students, and track occupancy.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 w-full sm:w-auto shadow-sm">
            <Plus className="w-4 h-4" /> Add Seats
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:-translate-y-0.5 transition-transform">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wide">Total Seats</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1">{totalSeats}</h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">Hostel study hall capacity</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-0.5 transition-transform">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wide">Available Seats</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-green-600 dark:text-green-400">{availableSeats}</h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">Ready for allocation</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-0.5 transition-transform">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wide">Occupied Seats</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-blue-600 dark:text-blue-400">{occupiedSeats}</h3>
              <p className="text-xs text-black/50 dark:text-white/50 mt-1">Assigned to students</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:-translate-y-0.5 transition-transform">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-black/50 dark:text-white/50 uppercase tracking-wide">Occupancy Rate</p>
              <h3 className="text-2xl sm:text-3xl font-bold mt-1">{occupancyRate}%</h3>
              <div className="w-28 bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                <div className="bg-primary-500 h-full rounded-full transition-all duration-500" style={{ width: `${occupancyRate}%` }}></div>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
            <Input 
              id="searchSeat"
              name="searchSeat"
              placeholder="Search seat number, student name, ID..." 
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
              All ({seats.length})
            </button>
            <button
              onClick={() => setFilterStatus('available')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'available' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
            >
              Available ({availableSeats})
            </button>
            <button
              onClick={() => setFilterStatus('occupied')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${filterStatus === 'occupied' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
            >
              Occupied ({occupiedSeats})
            </button>
          </div>
        </div>
      </div>

      {/* Seats Grid */}
      {loading ? (
        <div className="text-center py-16 text-black/50 dark:text-white/50">Loading library seats...</div>
      ) : seats.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <BookOpen className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-3" />
          <h3 className="text-lg font-medium">No Library Seats Added Yet</h3>
          <p className="text-black/50 dark:text-white/50 text-sm mt-1 max-w-sm mx-auto">
            Click on <strong>Add Seats</strong> above to create single or batch library seats.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} className="mt-4 gap-2">
            <Plus className="w-4 h-4" /> Add First Seat
          </Button>
        </div>
      ) : filteredSeats.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <BookOpen className="w-12 h-12 mx-auto text-black/20 dark:text-white/20 mb-3" />
          <h3 className="text-lg font-medium">No Seats Match Your Filter</h3>
          <p className="text-black/50 dark:text-white/50 text-sm mt-1">Try clearing your search query or changing the filter.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {currentSeats.map((seat, idx) => {
              const isOccupied = !!seat.studentId;
              const student = seat.studentId;
              const studentFullName = student ? `${student.name || ''} ${student.surname || ''}`.trim() : '';

              return (
                <motion.div
                  key={seat._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className={`h-full flex flex-col transition-all group relative border ${
                    isOccupied 
                      ? 'border-border bg-card' 
                      : 'border-dashed border-border/80 bg-card hover:border-primary-500/50'
                  }`}>
                    {/* Delete button on hover (Only for available seats) */}
                    {!isOccupied && (
                      <button
                        onClick={() => handleDeleteSeat(seat._id, seat.seatNumber, false)}
                        className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-all z-10"
                        title="Delete Vacant Seat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <CardHeader className="p-4 pb-2 border-b border-border/60">
                      <div className="flex justify-between items-start pr-6 gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-foreground truncate" title={seat.seatNumber}>
                              {seat.seatNumber}
                            </span>
                            {isOccupied ? (
                              <Badge variant="default" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] px-2 py-0.2 shrink-0">
                                Occupied
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[10px] px-2 py-0.2 shrink-0">
                                Available
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-black/50 dark:text-white/50 flex items-center gap-1 mt-0.5 truncate">
                            <Building className="w-3 h-3 shrink-0" /> {seat.section || 'Main Hall'} • Fl {seat.floor || 1}
                          </p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 flex-1 flex flex-col justify-between">
                      {isOccupied ? (
                        <div className="space-y-3">
                          {/* Student Info Box */}
                          <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border/50 min-w-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {student?.photo ? (
                                <img 
                                  src={student.photo} 
                                  alt={studentFullName} 
                                  className="w-9 h-9 rounded-full object-cover border border-border shrink-0 shadow-xs" 
                                />
                              ) : (
                                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm shrink-0">
                                  {(student?.name || 'U').charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm truncate text-foreground" title={studentFullName}>
                                  {studentFullName || 'Student'}
                                </p>
                                <p className="text-xs text-black/50 dark:text-white/50 truncate">
                                  ID: {student?.studentId} • Room {student?.roomNumber || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Meta details */}
                          <div className="space-y-1.5 text-xs text-black/60 dark:text-white/60">
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1 text-black/50 dark:text-white/50">
                                <Calendar className="w-3 h-3" /> Assigned:
                              </span>
                              <span className="font-medium">
                                {seat.assignedDate ? new Date(seat.assignedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Recently'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="flex items-center gap-1 text-black/50 dark:text-white/50">
                                <CreditCard className="w-3 h-3" /> Library Fee:
                              </span>
                              <span className={`font-semibold ${seat.feePaid ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                                {seat.feePaid ? '✅ Paid' : '⚠️ Pending'}
                              </span>
                            </div>
                            {seat.notes && (
                              <p className="text-[11px] italic text-black/50 dark:text-white/50 truncate pt-1 border-t border-border/40" title={seat.notes}>
                                Note: {seat.notes}
                              </p>
                            )}
                          </div>

                          {/* Action Buttons for Occupied Seat */}
                          <div className="pt-2 flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleVacateSeat(seat)} 
                              className="flex-1 text-xs gap-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/40"
                              title="Vacate Seat"
                            >
                              <UserMinus className="w-3.5 h-3.5" /> Vacate
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleOpenAssign(seat)} 
                              className="text-xs px-2.5"
                              title="Change Student"
                            >
                              Change
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col justify-between py-2">
                          <div className="text-center py-4 text-black/40 dark:text-white/40">
                            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-xs">Empty & Ready to Allocate</p>
                          </div>

                          <Button 
                            size="sm" 
                            onClick={() => handleOpenAssign(seat)} 
                            className="w-full gap-1.5 text-xs mt-auto bg-primary-600 hover:bg-primary-700 text-white"
                          >
                            <UserPlus className="w-3.5 h-3.5" /> Assign Student
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border mt-6">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </Button>
              <span className="text-sm text-black/60 dark:text-white/60 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add Seat Modal (Single or Batch) */}
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
                <div>
                  <h3 className="text-lg font-bold">Add Library Seats</h3>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Create individual seats or generate batch ranges</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Add Mode Selector */}
              <div className="p-6 pb-0">
                <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setAddMode('single')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      addMode === 'single' ? 'bg-card shadow-sm text-foreground' : 'text-black/60 dark:text-white/60'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> Single Seat
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMode('batch')}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      addMode === 'batch' ? 'bg-card shadow-sm text-foreground' : 'text-black/60 dark:text-white/60'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Batch Generate
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddSeat} className="p-6 space-y-4">
                {addMode === 'single' ? (
                  <>
                    <div>
                      <label htmlFor="seatNumber" className="block text-sm font-medium mb-1">
                        Seat Number *
                      </label>
                      <Input 
                        id="seatNumber"
                        name="seatNumber"
                        required 
                        placeholder="e.g. L-01, Seat-12, Desk-A"
                        value={newSeat.seatNumber}
                        onChange={(e) => setNewSeat({...newSeat, seatNumber: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="section" className="block text-sm font-medium mb-1">Section</label>
                        <Input 
                          id="section"
                          name="section"
                          placeholder="e.g. Main Hall"
                          value={newSeat.section}
                          onChange={(e) => setNewSeat({...newSeat, section: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="floor" className="block text-sm font-medium mb-1">Floor</label>
                        <Input 
                          id="floor"
                          name="floor"
                          type="number"
                          min="1"
                          value={newSeat.floor}
                          onChange={(e) => setNewSeat({...newSeat, floor: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="prefix" className="block text-xs font-medium mb-1">Prefix</label>
                        <Input 
                          id="prefix"
                          name="prefix"
                          placeholder="e.g. L-"
                          value={batchData.prefix}
                          onChange={(e) => setBatchData({...batchData, prefix: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="startNum" className="block text-xs font-medium mb-1">Start No. *</label>
                        <Input 
                          id="startNum"
                          name="startNum"
                          type="number"
                          required
                          min="1"
                          value={batchData.startNum}
                          onChange={(e) => setBatchData({...batchData, startNum: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="endNum" className="block text-xs font-medium mb-1">End No. *</label>
                        <Input 
                          id="endNum"
                          name="endNum"
                          type="number"
                          required
                          min="1"
                          value={batchData.endNum}
                          onChange={(e) => setBatchData({...batchData, endNum: e.target.value})}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-black/50 dark:text-white/50">
                      Preview: <strong>{batchData.prefix}{batchData.startNum || 1}</strong> to <strong>{batchData.prefix}{batchData.endNum || 10}</strong>
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="batchSection" className="block text-sm font-medium mb-1">Section</label>
                        <Input 
                          id="batchSection"
                          name="batchSection"
                          placeholder="e.g. Main Hall"
                          value={batchData.section}
                          onChange={(e) => setBatchData({...batchData, section: e.target.value})}
                        />
                      </div>
                      <div>
                        <label htmlFor="batchFloor" className="block text-sm font-medium mb-1">Floor</label>
                        <Input 
                          id="batchFloor"
                          name="batchFloor"
                          type="number"
                          min="1"
                          value={batchData.floor}
                          onChange={(e) => setBatchData({...batchData, floor: parseInt(e.target.value) || 1})}
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 flex justify-end gap-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {addMode === 'batch' ? 'Generate Seats' : 'Add Seat'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Assign Student Modal */}
      <AnimatePresence>
        {isAssignModalOpen && selectedSeat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-lg rounded-2xl shadow-xl overflow-hidden border border-border max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-border bg-black/5 dark:bg-white/5 shrink-0">
                <div>
                  <h3 className="text-lg font-bold">Assign Student to Seat {selectedSeat.seatNumber}</h3>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">Select a student who paid library fees</p>
                </div>
                <button onClick={() => setIsAssignModalOpen(false)} className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 flex flex-col">
                {/* Search Student */}
                <div className="space-y-1.5 shrink-0">
                  <label htmlFor="studentFilter" className="text-xs font-semibold text-black/60 dark:text-white/60 block">
                    Search Student
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
                    <Input 
                      id="studentFilter"
                      name="studentFilter"
                      placeholder="Search by student name, ID, or room..."
                      className="pl-9 text-sm"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Student Selection List */}
                <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
                  <label className="text-xs font-semibold text-black/60 dark:text-white/60 block">
                    Select Student * ({filteredStudents.length} available)
                  </label>
                  <div className="border border-border rounded-xl p-2 max-h-56 overflow-y-auto space-y-2 bg-black/5 dark:bg-white/5">
                    {filteredStudents.length === 0 ? (
                      <p className="text-center text-xs text-black/50 dark:text-white/50 py-6">No matching students found.</p>
                    ) : (
                      filteredStudents.map((st) => {
                        const isSelected = selectedStudentId === st._id;
                        const isAlreadyAssigned = st.assignedSeat && st.assignedSeat !== selectedSeat.seatNumber;

                        return (
                          <div
                            key={st._id}
                            onClick={() => {
                              if (isAlreadyAssigned) {
                                alert(`${st.name} ${st.surname || ''} is already assigned to Seat ${st.assignedSeat}. A student cannot hold more than one library seat. Please vacate Seat ${st.assignedSeat} first.`);
                                return;
                              }
                              setSelectedStudentId(st._id);
                            }}
                            className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                              isAlreadyAssigned
                                ? 'opacity-60 bg-black/[0.03] dark:bg-white/[0.03] border-dashed border-border cursor-not-allowed'
                                : isSelected 
                                  ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 ring-2 ring-primary-500/20 cursor-pointer' 
                                  : 'bg-card border-border/60 hover:border-border cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              {st.photo ? (
                                <img 
                                  src={st.photo} 
                                  alt={st.name} 
                                  className="w-8 h-8 rounded-full object-cover border border-border shrink-0 shadow-xs" 
                                />
                              ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  isSelected ? 'bg-primary-600 text-white' : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                                }`}>
                                  {(st.name || 'U').charAt(0)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-sm truncate text-foreground">
                                  {st.name} {st.surname || ''}
                                </p>
                                <p className="text-xs text-black/50 dark:text-white/50 truncate">
                                  ID: {st.studentId} • Room {st.roomNumber || 'N/A'}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0 flex flex-col items-end gap-1">
                              {isAlreadyAssigned ? (
                                <Badge variant="danger" className="text-[10px] px-1.5 py-0">
                                  Occupying Seat {st.assignedSeat}
                                </Badge>
                              ) : (
                                <>
                                  {st.feeInfo?.status === 'PAID' && (
                                    <Badge variant="success" className="text-[10px] px-1.5 py-0">Hostel Fee Paid</Badge>
                                  )}
                                  {st.feeInfo?.status === 'PARTIALLY PAID' && (
                                    <Badge variant="warning" className="text-[10px] px-1.5 py-0">Partially Paid</Badge>
                                  )}
                                  {st.feeInfo?.status === 'PENDING' && (
                                    <Badge variant="danger" className="text-[10px] px-1.5 py-0">Fee Pending</Badge>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Library Fee Paid Checkbox & Notes */}
                <div className="space-y-3 pt-2 shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={feePaid}
                      onChange={(e) => setFeePaid(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded border-border focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium">Library Fee Confirmed / Paid</span>
                  </label>

                  <div>
                    <label htmlFor="assignNotes" className="block text-xs font-medium mb-1 text-black/60 dark:text-white/60">
                      Notes (Optional)
                    </label>
                    <Input 
                      id="assignNotes"
                      name="assignNotes"
                      placeholder="e.g. Paid cash for 6 months, shift morning"
                      value={assignNotes}
                      onChange={(e) => setAssignNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-border shrink-0">
                  <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={assigning || !selectedStudentId}>
                    {assigning ? 'Assigning...' : 'Confirm Assignment'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LibraryManagement;
