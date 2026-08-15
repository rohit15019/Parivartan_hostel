import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, FileEdit, IndianRupee, X, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

const StudentsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const initialState = {
    surname: '', name: '', fatherName: '', email: '', 
    phone: '', fatherPhone: '', motherPhone: '', 
    dob: '', village: '', taluka: '', district: '', 
    pincode: '', school: '', college: '', room: ''
  };
  const [newStudent, setNewStudent] = useState(initialState);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [students, setStudents] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, roomsRes] = await Promise.all([
          api.get('/students'),
          api.get('/rooms')
        ]);
        setStudents(studentsRes.data);
        setRooms(roomsRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const generatedEmail = newStudent.email || `student_${Date.now()}@hostel.com`;
      // Mocking password creation and passing required fields for the backend
      const studentData = {
        ...newStudent,
        studentId: `STU-2026-${String(students.length + 1).padStart(3, '0')}`,
        email: generatedEmail,
        password: 'password123', // Default password for new students
        roomNumber: newStudent.room,
        course: 'B.Tech',
        year: '1st Year',
        totalFees: 60000,
        paymentFrequency: 'Yearly'
      };

      const { data } = await api.post('/students', studentData);
      
      // Update local state
      setStudents([...students, { ...data.student, fee: data.fee }]);
      setIsAddModalOpen(false);
      setNewStudent(initialState);
      alert(`Student ${newStudent.name} added successfully! They can now login using ${generatedEmail} and password: password123`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const studentIdToUpdate = editingStudent._id || editingStudent.id;
      const { data } = await api.put(`/students/${studentIdToUpdate}`, {
        surname: editingStudent.surname,
        name: editingStudent.name,
        fatherName: editingStudent.fatherName,
        phone: editingStudent.phone,
        fatherPhone: editingStudent.fatherPhone,
        motherPhone: editingStudent.motherPhone,
        dob: editingStudent.dob,
        village: editingStudent.village,
        taluka: editingStudent.taluka,
        district: editingStudent.district,
        pincode: editingStudent.pincode,
        school: editingStudent.school,
        college: editingStudent.college,
        roomNumber: editingStudent.room || editingStudent.roomNumber
      });
      
      // Update local state
      setStudents(students.map(s => (s._id || s.id) === studentIdToUpdate ? { ...s, ...data } : s));
      setIsEditModalOpen(false);
      setEditingStudent(null);
      alert('Student updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/students/${studentId}`);
      setStudents(students.filter(s => (s._id || s.id) !== studentId));
      alert('Student deleted successfully.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const openEditModal = (student) => {
    let formattedDob = '';
    if (student.dob) {
      const d = new Date(student.dob);
      if (!isNaN(d.getTime())) {
        formattedDob = d.toISOString().split('T')[0];
      }
    }
    setEditingStudent({
      ...student,
      room: student.roomNumber || student.room || '',
      dob: formattedDob,
      surname: student.surname || '',
      fatherName: student.fatherName || '',
      fatherPhone: student.fatherPhone || '',
      motherPhone: student.motherPhone || '',
      village: student.village || '',
      taluka: student.taluka || '',
      district: student.district || '',
      pincode: student.pincode || '',
      school: student.school || '',
      college: student.college || ''
    });
    setIsEditModalOpen(true);
  };

  const handleFeeNavigation = (student) => {
    navigate('/admin/fees', { state: { studentId: student._id || student.id, student } });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return <Badge variant="success">🟢 PAID</Badge>;
      case 'HALF PAID': return <Badge variant="warning">🟡 HALF PAID</Badge>;
      case 'PENDING': return <Badge variant="danger">🔴 PENDING</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const room = student.roomNumber || student.room || '';
    return (
      (student.name || '').toLowerCase().includes(searchLower) ||
      (student.studentId || '').toLowerCase().includes(searchLower) ||
      room.toLowerCase().includes(searchLower) ||
      (student.phone || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-black/60 dark:text-white/60">Manage all hostel students and their fees.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddModalOpen(true)}>
          <Plus className="w-4 h-4" /> Add Student
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
            <Input 
              placeholder="Search by name, ID, room or phone..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-l-lg">Student</th>
                <th className="px-6 py-4 font-semibold">Room & Contact</th>
                <th className="px-6 py-4 font-semibold">Fees Status</th>
                <th className="px-6 py-4 font-semibold">Payment Progress</th>
                <th className="px-6 py-4 font-semibold rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Loading students...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center">No students found.</td></tr>
              ) : filteredStudents.map((student, idx) => {
                const total = student.fee?.totalFees || 0;
                const paid = student.fee?.paidAmount || 0;
                const status = total > 0 ? (paid >= total ? 'PAID' : paid > 0 ? 'HALF PAID' : 'PENDING') : 'PENDING';
                return (
                <motion.tr 
                  key={student._id || student.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold shrink-0">
                        {(student.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-xs text-black/50 dark:text-white/50">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">Room {student.roomNumber || student.room}</div>
                    <div className="text-xs text-black/50 dark:text-white/50">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(status)}
                  </td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-primary-600 dark:text-primary-400">₹{paid.toLocaleString()}</span>
                      <span className="text-black/50 dark:text-white/50">/ ₹{total.toLocaleString()}</span>
                    </div>
                    <ProgressBar value={paid} max={total || 1} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20" onClick={() => handleFeeNavigation(student)}>
                        <IndianRupee className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditModal(student)}>
                        <FileEdit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteStudent(student._id || student.id, student.name)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              )})}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card rounded-xl shadow-xl overflow-hidden border border-border max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold">Add New Student</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Surname <span className="text-red-500">*</span></label>
                      <Input required value={newStudent.surname} onChange={(e) => setNewStudent({...newStudent, surname: e.target.value})} placeholder="e.g. Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student Name <span className="text-red-500">*</span></label>
                      <Input required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="e.g. John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Father Name <span className="text-red-500">*</span></label>
                      <Input required value={newStudent.fatherName} onChange={(e) => setNewStudent({...newStudent, fatherName: e.target.value})} placeholder="e.g. Richard" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address (Optional)</label>
                      <Input type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} placeholder="e.g. student@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student Phone No. <span className="text-red-500">*</span></label>
                      <Input required type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Father Phone No. <span className="text-red-500">*</span></label>
                      <Input required type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={newStudent.fatherPhone} onChange={(e) => setNewStudent({...newStudent, fatherPhone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mother Phone No. (Optional)</label>
                      <Input type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={newStudent.motherPhone} onChange={(e) => setNewStudent({...newStudent, motherPhone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Of Birth <span className="text-red-500">*</span></label>
                      <Input required type="date" value={newStudent.dob} onChange={(e) => setNewStudent({...newStudent, dob: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Village Name <span className="text-red-500">*</span></label>
                      <Input required value={newStudent.village} onChange={(e) => setNewStudent({...newStudent, village: e.target.value})} placeholder="Village" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Taluka <span className="text-red-500">*</span></label>
                      <Input required value={newStudent.taluka} onChange={(e) => setNewStudent({...newStudent, taluka: e.target.value})} placeholder="Taluka" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">District <span className="text-red-500">*</span></label>
                      <Input required value={newStudent.district} onChange={(e) => setNewStudent({...newStudent, district: e.target.value})} placeholder="District" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pin Code (Optional)</label>
                      <Input value={newStudent.pincode} onChange={(e) => setNewStudent({...newStudent, pincode: e.target.value})} placeholder="Pincode" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">School Name <span className="text-red-500">*</span></label>
                      <Input required value={newStudent.school} onChange={(e) => setNewStudent({...newStudent, school: e.target.value})} placeholder="School Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">College Name (Optional)</label>
                      <Input value={newStudent.college} onChange={(e) => setNewStudent({...newStudent, college: e.target.value})} placeholder="College Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Room Number <span className="text-red-500">*</span></label>
                      <select 
                        required 
                        value={newStudent.room} 
                        onChange={(e) => setNewStudent({...newStudent, room: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-black/40 dark:placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      >
                        <option value="" className="text-black dark:text-black">Select Room</option>
                        {rooms.map(room => (
                          <option key={room._id} value={room.roomNumber} className="text-black dark:text-black">
                            Room {room.roomNumber} {room.currentOccupants >= room.capacity ? '(Full)' : `(Avail: ${room.capacity - room.currentOccupants})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-3 mt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Add Student</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card rounded-xl shadow-xl overflow-hidden border border-border max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-border flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold">Edit Student Details</h2>
                <button onClick={() => setIsEditModalOpen(false)} className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <form onSubmit={handleEditStudent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Surname <span className="text-red-500">*</span></label>
                      <Input required value={editingStudent.surname} onChange={(e) => setEditingStudent({...editingStudent, surname: e.target.value})} placeholder="e.g. Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student Name <span className="text-red-500">*</span></label>
                      <Input required value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} placeholder="e.g. John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Father Name <span className="text-red-500">*</span></label>
                      <Input required value={editingStudent.fatherName} onChange={(e) => setEditingStudent({...editingStudent, fatherName: e.target.value})} placeholder="e.g. Richard" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Student Phone No. <span className="text-red-500">*</span></label>
                      <Input required type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={editingStudent.phone} onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Father Phone No. <span className="text-red-500">*</span></label>
                      <Input required type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={editingStudent.fatherPhone} onChange={(e) => setEditingStudent({...editingStudent, fatherPhone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mother Phone No. (Optional)</label>
                      <Input type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={editingStudent.motherPhone} onChange={(e) => setEditingStudent({...editingStudent, motherPhone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date Of Birth <span className="text-red-500">*</span></label>
                      <Input required type="date" value={editingStudent.dob} onChange={(e) => setEditingStudent({...editingStudent, dob: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Village Name <span className="text-red-500">*</span></label>
                      <Input required value={editingStudent.village} onChange={(e) => setEditingStudent({...editingStudent, village: e.target.value})} placeholder="Village" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Taluka <span className="text-red-500">*</span></label>
                      <Input required value={editingStudent.taluka} onChange={(e) => setEditingStudent({...editingStudent, taluka: e.target.value})} placeholder="Taluka" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">District <span className="text-red-500">*</span></label>
                      <Input required value={editingStudent.district} onChange={(e) => setEditingStudent({...editingStudent, district: e.target.value})} placeholder="District" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pin Code (Optional)</label>
                      <Input value={editingStudent.pincode} onChange={(e) => setEditingStudent({...editingStudent, pincode: e.target.value})} placeholder="Pincode" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">School Name <span className="text-red-500">*</span></label>
                      <Input required value={editingStudent.school} onChange={(e) => setEditingStudent({...editingStudent, school: e.target.value})} placeholder="School Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">College Name (Optional)</label>
                      <Input value={editingStudent.college} onChange={(e) => setEditingStudent({...editingStudent, college: e.target.value})} placeholder="College Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Room Number <span className="text-red-500">*</span></label>
                      <select 
                        required 
                        value={editingStudent.room} 
                        onChange={(e) => setEditingStudent({...editingStudent, room: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-black/40 dark:placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      >
                        <option value="" className="text-black dark:text-black">Select Room</option>
                        {rooms.map(room => (
                          <option key={room._id} value={room.roomNumber} className="text-black dark:text-black">
                            Room {room.roomNumber}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-border pt-6">
                    <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentsList;
