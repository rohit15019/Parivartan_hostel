import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Plus, FileEdit, IndianRupee, X, Trash2, 
  Key, Eye, EyeOff, Copy, Check, User, Phone, MapPin, 
  Calendar, School, Home, Lock
} from 'lucide-react';
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
  const [editActiveTab, setEditActiveTab] = useState('details'); // 'details' | 'password'
  
  // Profile Viewer Modal States
  const [viewingProfileStudent, setViewingProfileStudent] = useState(null);
  const [showProfilePassword, setShowProfilePassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Dedicated Change Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordStudent, setPasswordStudent] = useState(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  // Edit Modal Password Tab States
  const [editNewPassword, setEditNewPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editPasswordUpdating, setEditPasswordUpdating] = useState(false);

  const initialState = {
    surname: '', name: '', fatherName: '', email: '', 
    phone: '', fatherPhone: '', motherPhone: '', 
    dob: '', village: '', taluka: '', district: '', 
    pincode: '', school: '', college: '', room: '',
    deposit: '',
    monthlyFee: '',
    feeDueDay: 10
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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active': return <Badge variant="success">🟢 Active</Badge>;
      case 'Away': return <Badge variant="warning">🟡 Away</Badge>;
      case 'Left': return <Badge variant="danger">🔴 Left</Badge>;
      default: return <Badge variant="success">{status || 'Active'}</Badge>;
    }
  };

  const handleCopyPassword = (password) => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const openProfileModal = (student) => {
    setViewingProfileStudent(student);
    setShowProfilePassword(false);
    setCopiedPassword(false);
  };

  const openPasswordModal = (student) => {
    setPasswordStudent(student);
    setNewPasswordValue('');
    setShowNewPassword(false);
    setIsPasswordModalOpen(true);
  };

  const handlePasswordModalSubmit = async (e) => {
    e.preventDefault();
    if (!newPasswordValue || newPasswordValue.trim().length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }

    const studentId = passwordStudent._id || passwordStudent.id;
    setPasswordUpdating(true);
    try {
      const { data } = await api.put(`/students/${studentId}/password`, {
        newPassword: newPasswordValue.trim()
      });

      // Update state in students array
      setStudents(prev => prev.map(s => {
        if ((s._id || s.id) === studentId) {
          return {
            ...s,
            rawPassword: data.rawPassword,
            userId: {
              ...s.userId,
              rawPassword: data.rawPassword
            }
          };
        }
        return s;
      }));

      // Update viewingProfileStudent if currently viewing
      if (viewingProfileStudent && (viewingProfileStudent._id || viewingProfileStudent.id) === studentId) {
        setViewingProfileStudent(prev => ({
          ...prev,
          rawPassword: data.rawPassword,
          userId: {
            ...prev.userId,
            rawPassword: data.rawPassword
          }
        }));
      }

      // Update editingStudent if currently editing
      if (editingStudent && (editingStudent._id || editingStudent.id) === studentId) {
        setEditingStudent(prev => ({
          ...prev,
          rawPassword: data.rawPassword,
          userId: {
            ...prev.userId,
            rawPassword: data.rawPassword
          }
        }));
      }

      alert(`Password updated successfully for ${passwordStudent.name}!`);
      setIsPasswordModalOpen(false);
      setPasswordStudent(null);
      setNewPasswordValue('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordUpdating(false);
    }
  };

  const handleEditPasswordTabSubmit = async (e) => {
    e.preventDefault();
    if (!editNewPassword || editNewPassword.trim().length < 4) {
      alert('Password must be at least 4 characters long.');
      return;
    }

    const studentId = editingStudent._id || editingStudent.id;
    setEditPasswordUpdating(true);
    try {
      const { data } = await api.put(`/students/${studentId}/password`, {
        newPassword: editNewPassword.trim()
      });

      // Update local state
      setStudents(prev => prev.map(s => {
        if ((s._id || s.id) === studentId) {
          return {
            ...s,
            rawPassword: data.rawPassword,
            userId: {
              ...s.userId,
              rawPassword: data.rawPassword
            }
          };
        }
        return s;
      }));

      setEditingStudent(prev => ({
        ...prev,
        rawPassword: data.rawPassword,
        userId: {
          ...prev.userId,
          rawPassword: data.rawPassword
        }
      }));

      if (viewingProfileStudent && (viewingProfileStudent._id || viewingProfileStudent.id) === studentId) {
        setViewingProfileStudent(prev => ({
          ...prev,
          rawPassword: data.rawPassword,
          userId: {
            ...prev.userId,
            rawPassword: data.rawPassword
          }
        }));
      }

      alert(`Password updated successfully for ${editingStudent.name}!`);
      setEditNewPassword('');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
    } finally {
      setEditPasswordUpdating(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    const cleanPhone = (newStudent.phone || '').trim();
    if (students.some(s => (s.phone || '').trim() === cleanPhone)) {
      alert('A student with this mobile number already exists');
      return;
    }

    if (newStudent.deposit === '' || newStudent.deposit === null || isNaN(Number(newStudent.deposit)) || Number(newStudent.deposit) < 0) {
      alert('Deposit amount is required and must be 0 or greater');
      return;
    }

    if (newStudent.monthlyFee === '' || newStudent.monthlyFee === null || isNaN(Number(newStudent.monthlyFee)) || Number(newStudent.monthlyFee) <= 0) {
      alert('Monthly fee rate is required and must be greater than 0');
      return;
    }

    try {
      const studentData = {
        ...newStudent,
        deposit: Number(newStudent.deposit),
        roomNumber: newStudent.room,
        course: '',
        year: '1st Year',
        monthlyFee: Number(newStudent.monthlyFee),
        feeDueDay: Number(newStudent.feeDueDay) || 10
      };

      const { data } = await api.post('/students', studentData);
      
      // Update local state
      setStudents([...students, { ...data.student, fee: data.fee }]);
      setIsAddModalOpen(false);
      setNewStudent(initialState);
      
      // Refresh rooms so occupancies update
      const roomsRes = await api.get('/rooms');
      setRooms(roomsRes.data);

      alert(`Student ${data.student.name} added successfully! (ID: ${data.student.studentId})`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add student');
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    const studentIdToUpdate = editingStudent._id || editingStudent.id;
    const cleanPhone = (editingStudent.phone || '').trim();
    if (students.some(s => (s._id || s.id) !== studentIdToUpdate && (s.phone || '').trim() === cleanPhone)) {
      alert('A student with this mobile number already exists');
      return;
    }

    if (editingStudent.deposit === '' || editingStudent.deposit === null || isNaN(Number(editingStudent.deposit)) || Number(editingStudent.deposit) < 0) {
      alert('Deposit amount is required and must be 0 or greater');
      return;
    }

    if (editingStudent.monthlyFee === '' || editingStudent.monthlyFee === null || isNaN(Number(editingStudent.monthlyFee)) || Number(editingStudent.monthlyFee) <= 0) {
      alert('Monthly fee rate is required and must be greater than 0');
      return;
    }

    try {
      const { data } = await api.put(`/students/${studentIdToUpdate}`, {
        email: editingStudent.email,
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
        deposit: Number(editingStudent.deposit),
        monthlyFee: Number(editingStudent.monthlyFee),
        feeDueDay: Number(editingStudent.feeDueDay) || 10,
        roomNumber: editingStudent.room || editingStudent.roomNumber
      });
      
      // Update local state
      setStudents(students.map(s => (s._id || s.id) === studentIdToUpdate ? { ...s, ...data } : s));
      if (viewingProfileStudent && (viewingProfileStudent._id || viewingProfileStudent.id) === studentIdToUpdate) {
        setViewingProfileStudent(prev => ({ ...prev, ...data }));
      }
      setIsEditModalOpen(false);
      setEditingStudent(null);
      
      // Refresh rooms so occupancies update
      const roomsRes = await api.get('/rooms');
      setRooms(roomsRes.data);

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
      if (viewingProfileStudent && (viewingProfileStudent._id || viewingProfileStudent.id) === studentId) {
        setViewingProfileStudent(null);
      }
      
      // Refresh rooms so occupancies update
      const roomsRes = await api.get('/rooms');
      setRooms(roomsRes.data);

      alert('Student deleted successfully.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete student');
    }
  };

  const openEditModal = (student, defaultTab = 'details') => {
    let formattedDob = '';
    if (student.dob) {
      const d = new Date(student.dob);
      if (!isNaN(d.getTime())) {
        formattedDob = d.toISOString().split('T')[0];
      }
    }
    const studentEmail = student.userId?.email || student.email || '';
    setEditingStudent({
      ...student,
      email: studentEmail,
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
      college: student.college || '',
      deposit: student.deposit !== undefined && student.deposit !== null ? student.deposit : '',
      monthlyFee: student.monthlyFee || 6000,
      feeDueDay: student.feeDueDay || 10
    });
    setEditActiveTab(defaultTab);
    setEditNewPassword('');
    setShowEditPassword(false);
    setIsEditModalOpen(true);
  };

  const handleFeeNavigation = (student) => {
    navigate('/admin/fees', { state: { studentId: student._id || student.id, student } });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  const filteredStudents = students.filter(student => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const room = student.roomNumber || student.room || '';
    return (
      (student.name || '').toLowerCase().includes(searchLower) ||
      (student.surname || '').toLowerCase().includes(searchLower) ||
      (student.studentId || '').toLowerCase().includes(searchLower) ||
      room.toLowerCase().includes(searchLower) ||
      (student.phone || '').toLowerCase().includes(searchLower)
    );
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
            <Input 
              name="search"
              id="search"
              placeholder="Search by name, ID, room or phone..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="gap-2 w-full sm:w-auto" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-l-lg">Student (Click to view profile)</th>
                <th className="px-6 py-4 font-semibold">Room & Contact</th>
                <th className="px-6 py-4 font-semibold">Deposit Paid</th>
                <th className="px-6 py-4 font-semibold">Payment Progress</th>
                <th className="px-6 py-4 font-semibold rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="p-4 text-center">Loading students...</td></tr>
              ) : currentStudents.length === 0 ? (
                <tr><td colSpan="5" className="p-4 text-center">No students found.</td></tr>
              ) : currentStudents.map((student, idx) => {
                const total = student.fee?.totalFees || 0;
                const paid = student.fee?.paidAmount || 0;
                return (
                <motion.tr 
                  key={student._id || student.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-border last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div 
                      onClick={() => openProfileModal(student)}
                      className="flex items-center gap-3 cursor-pointer group select-none"
                      title="Click to view full profile & password"
                    >
                      {student.photo ? (
                        <img 
                          src={student.photo} 
                          alt={student.name} 
                          className="w-10 h-10 rounded-full object-cover border border-border shrink-0 shadow-xs group-hover:scale-105 group-hover:ring-2 group-hover:ring-primary-500 transition-all" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold shrink-0 group-hover:scale-105 group-hover:ring-2 group-hover:ring-primary-500 transition-all">
                          {(student.name || 'U').charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center gap-1.5">
                          <span>{student.surname ? `${student.surname} ${student.name}` : student.name}</span>
                        </div>
                        <div className="text-xs text-black/50 dark:text-white/50">{student.studentId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium">Room {student.roomNumber || student.room}</div>
                    <div className="text-xs text-black/50 dark:text-white/50">{student.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(student.deposit || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 min-w-[200px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-primary-600 dark:text-primary-400">₹{paid.toLocaleString()}</span>
                      <span className="text-black/50 dark:text-white/50">/ ₹{total.toLocaleString()}</span>
                    </div>
                    <ProgressBar value={paid} max={total || 1} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                        title="View Full Profile & Password"
                        onClick={() => openProfileModal(student)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20" 
                        title="Fee Ledger & Management"
                        onClick={() => handleFeeNavigation(student)}
                      >
                        <IndianRupee className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        title="Edit Student Information"
                        onClick={() => openEditModal(student, 'details')}
                      >
                        <FileEdit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                        title="Delete Student"
                        onClick={() => handleDeleteStudent(student._id || student.id, student.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              )})}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-border">
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
      </Card>

      {/* ================= STUDENT PROFILE MODAL ================= */}
      <AnimatePresence>
        {viewingProfileStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-3xl bg-card rounded-2xl shadow-2xl overflow-hidden border border-border max-h-[92vh] flex flex-col"
            >
              {/* Profile Header */}
              <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 dark:from-primary-900 dark:to-primary-950 p-5 sm:p-6 text-white shrink-0">
                <button 
                  onClick={() => setViewingProfileStudent(null)} 
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors"
                  aria-label="Close profile modal"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  {viewingProfileStudent.photo ? (
                    <img 
                      src={viewingProfileStudent.photo} 
                      alt={viewingProfileStudent.name} 
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl shrink-0" 
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/15 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-xl">
                      {(viewingProfileStudent.name || 'U').charAt(0)}
                    </div>
                  )}

                  <div className="text-center sm:text-left space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold">
                        {viewingProfileStudent.surname ? `${viewingProfileStudent.surname} ` : ''}
                        {viewingProfileStudent.name}
                        {viewingProfileStudent.fatherName ? ` ${viewingProfileStudent.fatherName}` : ''}
                      </h2>
                      {getStatusBadge(viewingProfileStudent.status)}
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-white/80 font-medium">
                      <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> {viewingProfileStudent.studentId}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5" /> Room {viewingProfileStudent.roomNumber || viewingProfileStudent.room || 'N/A'}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> Joined {formatDate(viewingProfileStudent.joiningDate || viewingProfileStudent.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Body */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
                
                {/* Credentials & Password Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-primary-50/40 to-blue-50/60 dark:from-amber-950/20 dark:via-primary-950/20 dark:to-blue-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Student Portal Login Credentials
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs font-semibold gap-1.5 border-amber-300 dark:border-amber-700 bg-card hover:bg-amber-100 dark:hover:bg-amber-900/30 text-foreground"
                      onClick={() => {
                        openPasswordModal(viewingProfileStudent);
                      }}
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-600" /> Change Password
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 rounded-xl bg-card border border-border shadow-2xs space-y-1">
                      <span className="text-[11px] text-black/50 dark:text-white/50 font-medium block">Login Username / ID</span>
                      <div className="font-mono text-xs sm:text-sm font-bold text-foreground truncate">
                        {viewingProfileStudent.studentId}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border shadow-2xs space-y-1">
                      <span className="text-[11px] text-black/50 dark:text-white/50 font-medium block">Registered Email</span>
                      <div className="text-xs sm:text-sm font-semibold text-foreground truncate" title={viewingProfileStudent.userId?.email || viewingProfileStudent.email}>
                        {viewingProfileStudent.userId?.email || viewingProfileStudent.email || 'N/A'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-card border border-border shadow-2xs space-y-1">
                      <span className="text-[11px] text-black/50 dark:text-white/50 font-medium block">Student Password</span>
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs sm:text-sm font-bold text-primary-700 dark:text-primary-300 tracking-wider">
                          {showProfilePassword 
                            ? (viewingProfileStudent.userId?.rawPassword || viewingProfileStudent.rawPassword || 'password123') 
                            : '••••••••••••'}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowProfilePassword(!showProfilePassword)}
                            className="p-1 rounded-md text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white hover:bg-black/5 transition-colors"
                            title={showProfilePassword ? "Hide password" : "Show password"}
                          >
                            {showProfilePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyPassword(viewingProfileStudent.userId?.rawPassword || viewingProfileStudent.rawPassword || 'password123')}
                            className={`p-1 rounded-md transition-colors ${copiedPassword ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' : 'text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white hover:bg-black/5'}`}
                            title="Copy password to clipboard"
                          >
                            {copiedPassword ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid of Student Information Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Personal & Contact Details */}
                  <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary-600" /> Contact & Personal Details
                    </h4>
                    <div className="space-y-2 text-xs divide-y divide-border">
                      <div className="flex justify-between pt-1">
                        <span className="text-black/50 dark:text-white/50">Student Phone:</span>
                        <a href={`tel:${viewingProfileStudent.phone}`} className="font-semibold text-primary-600 hover:underline">
                          {viewingProfileStudent.phone || 'N/A'}
                        </a>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Father's Phone:</span>
                        <a href={`tel:${viewingProfileStudent.fatherPhone}`} className="font-semibold text-foreground hover:underline">
                          {viewingProfileStudent.fatherPhone || 'N/A'}
                        </a>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Mother's Phone:</span>
                        <span className="font-semibold text-foreground">
                          {viewingProfileStudent.motherPhone || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Date of Birth:</span>
                        <span className="font-semibold text-foreground">
                          {formatDate(viewingProfileStudent.dob)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Permanent Address */}
                  <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary-600" /> Permanent Address
                    </h4>
                    <div className="space-y-2 text-xs divide-y divide-border">
                      <div className="flex justify-between pt-1">
                        <span className="text-black/50 dark:text-white/50">Village / Town:</span>
                        <span className="font-semibold text-foreground">{viewingProfileStudent.village || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Taluka:</span>
                        <span className="font-semibold text-foreground">{viewingProfileStudent.taluka || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">District:</span>
                        <span className="font-semibold text-foreground">{viewingProfileStudent.district || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Pin Code:</span>
                        <span className="font-semibold text-foreground">{viewingProfileStudent.pincode || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Details */}
                  <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60 flex items-center gap-2">
                      <School className="w-4 h-4 text-primary-600" /> Academic & Education
                    </h4>
                    <div className="space-y-2 text-xs divide-y divide-border">
                      <div className="flex justify-between pt-1">
                        <span className="text-black/50 dark:text-white/50">School Name:</span>
                        <span className="font-semibold text-foreground text-right">{viewingProfileStudent.school || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">College Name:</span>
                        <span className="font-semibold text-foreground text-right">{viewingProfileStudent.college || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Course / Stream:</span>
                        <span className="font-semibold text-foreground">{viewingProfileStudent.course || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Academic Year:</span>
                        <span className="font-semibold text-foreground">{viewingProfileStudent.year || '1st Year'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hostel Fee & Stay Details */}
                  <div className="p-4 rounded-2xl bg-card border border-border space-y-3 shadow-2xs">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black/60 dark:text-white/60 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-primary-600" /> Hostel Stay & Fee Structure
                    </h4>
                    <div className="space-y-2 text-xs divide-y divide-border">
                      <div className="flex justify-between pt-1">
                        <span className="text-black/50 dark:text-white/50">Room Assigned:</span>
                        <span className="font-semibold text-foreground">Room {viewingProfileStudent.roomNumber || viewingProfileStudent.room || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Security Deposit Paid:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(viewingProfileStudent.deposit || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Monthly Fee Rate:</span>
                        <span className="font-bold text-primary-600 dark:text-primary-400">
                          ₹{Number(viewingProfileStudent.monthlyFee || 0).toLocaleString()} / month
                        </span>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-black/50 dark:text-white/50">Fee Due Day:</span>
                        <span className="font-semibold text-foreground">
                          {viewingProfileStudent.feeDueDay || 10}th of every month
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Profile Footer */}
              <div className="p-4 sm:p-5 border-t border-border bg-black/[0.02] dark:bg-white/[0.02] flex flex-wrap justify-between items-center gap-3 shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => {
                    const stu = viewingProfileStudent;
                    setViewingProfileStudent(null);
                    handleFeeNavigation(stu);
                  }}
                >
                  <IndianRupee className="w-4 h-4" /> View Fee Ledger
                </Button>

                <div className="flex items-center gap-2.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1.5"
                    onClick={() => {
                      const stu = viewingProfileStudent;
                      setViewingProfileStudent(null);
                      openEditModal(stu, 'password');
                    }}
                  >
                    <Key className="w-4 h-4 text-amber-600" /> Change Password
                  </Button>
                  <Button 
                    size="sm" 
                    className="gap-1.5"
                    onClick={() => {
                      const stu = viewingProfileStudent;
                      setViewingProfileStudent(null);
                      openEditModal(stu, 'details');
                    }}
                  >
                    <FileEdit className="w-4 h-4" /> Edit Student
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= DEDICATED CHANGE PASSWORD MODAL ================= */}
      <AnimatePresence>
        {isPasswordModalOpen && passwordStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card rounded-2xl shadow-2xl overflow-hidden border border-border p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">Change Password</h3>
                    <p className="text-xs text-black/50 dark:text-white/50">{passwordStudent.name} ({passwordStudent.studentId})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-black/50"
                  aria-label="Close change password modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordModalSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-1 text-xs">
                  <span className="text-black/50 dark:text-white/50 block font-medium">Current Password</span>
                  <div className="font-mono font-bold text-foreground">
                    {passwordStudent.userId?.rawPassword || passwordStudent.rawPassword || 'password123'}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="modalNewPassword" className="text-xs font-semibold block text-foreground">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      id="modalNewPassword"
                      name="modalNewPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      minLength={4}
                      placeholder="Enter new password (min 4 characters)"
                      value={newPasswordValue}
                      onChange={(e) => setNewPasswordValue(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPasswordValue('password123')}
                    className="text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Quick-fill default (password123)
                  </button>
                </div>

                <div className="pt-3 border-t border-border flex justify-end gap-2.5">
                  <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={passwordUpdating} className="font-semibold gap-2">
                    <Check className="w-4 h-4" /> {passwordUpdating ? 'Updating...' : 'Save New Password'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= ADD STUDENT MODAL ================= */}
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
                <button onClick={() => setIsAddModalOpen(false)} className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white" aria-label="Close modal">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto p-6">
                <form onSubmit={handleAddStudent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="add_surname" className="text-sm font-medium">Surname <span className="text-red-500">*</span></label>
                      <Input name="add_surname" id="add_surname" required value={newStudent.surname} onChange={(e) => setNewStudent({...newStudent, surname: e.target.value})} placeholder="e.g. Doe" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_name" className="text-sm font-medium">Student Name <span className="text-red-500">*</span></label>
                      <Input name="add_name" id="add_name" required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="e.g. John" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_fatherName" className="text-sm font-medium">Father Name <span className="text-red-500">*</span></label>
                      <Input name="add_fatherName" id="add_fatherName" required value={newStudent.fatherName} onChange={(e) => setNewStudent({...newStudent, fatherName: e.target.value})} placeholder="e.g. Richard" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_email" className="text-sm font-medium">Email Address (Optional)</label>
                      <Input name="add_email" id="add_email" type="email" value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} placeholder="e.g. student@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_phone" className="text-sm font-medium">Student Phone No. <span className="text-red-500">*</span></label>
                      <Input name="add_phone" id="add_phone" required type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_fatherPhone" className="text-sm font-medium">Father Phone No. <span className="text-red-500">*</span></label>
                      <Input name="add_fatherPhone" id="add_fatherPhone" required type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={newStudent.fatherPhone} onChange={(e) => setNewStudent({...newStudent, fatherPhone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_motherPhone" className="text-sm font-medium">Mother Phone No. (Optional)</label>
                      <Input name="add_motherPhone" id="add_motherPhone" type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={newStudent.motherPhone} onChange={(e) => setNewStudent({...newStudent, motherPhone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_dob" className="text-sm font-medium">Date Of Birth <span className="text-red-500">*</span></label>
                      <Input name="add_dob" id="add_dob" required type="date" value={newStudent.dob} onChange={(e) => setNewStudent({...newStudent, dob: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_village" className="text-sm font-medium">Village Name <span className="text-red-500">*</span></label>
                      <Input name="add_village" id="add_village" required value={newStudent.village} onChange={(e) => setNewStudent({...newStudent, village: e.target.value})} placeholder="Village" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_taluka" className="text-sm font-medium">Taluka <span className="text-red-500">*</span></label>
                      <Input name="add_taluka" id="add_taluka" required value={newStudent.taluka} onChange={(e) => setNewStudent({...newStudent, taluka: e.target.value})} placeholder="Taluka" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_district" className="text-sm font-medium">District <span className="text-red-500">*</span></label>
                      <Input name="add_district" id="add_district" required value={newStudent.district} onChange={(e) => setNewStudent({...newStudent, district: e.target.value})} placeholder="District" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_pincode" className="text-sm font-medium">Pin Code (Optional)</label>
                      <Input name="add_pincode" id="add_pincode" value={newStudent.pincode} onChange={(e) => setNewStudent({...newStudent, pincode: e.target.value})} placeholder="Pincode" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_school" className="text-sm font-medium">School Name <span className="text-red-500">*</span></label>
                      <Input name="add_school" id="add_school" required value={newStudent.school} onChange={(e) => setNewStudent({...newStudent, school: e.target.value})} placeholder="School Name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_college" className="text-sm font-medium">College Name (Optional)</label>
                      <Input name="add_college" id="add_college" value={newStudent.college} onChange={(e) => setNewStudent({...newStudent, college: e.target.value})} placeholder="College Name" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_room" className="text-sm font-medium">Room Number <span className="text-red-500">*</span></label>
                      <select 
                        name="add_room"
                        id="add_room"
                        required 
                        value={newStudent.room} 
                        onChange={(e) => setNewStudent({...newStudent, room: e.target.value})}
                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-black/40 dark:placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                      >
                        <option value="" className="text-black dark:text-black">Select Room</option>
                        {rooms.map(room => {
                          const isFull = room.currentOccupants >= room.capacity;
                          return (
                            <option 
                              key={room._id} 
                              value={room.roomNumber} 
                              disabled={isFull}
                              className="text-black dark:text-black"
                            >
                              Room {room.roomNumber} {isFull ? '(Full)' : `(Avail: ${room.capacity - room.currentOccupants})`}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_deposit" className="text-sm font-medium">Deposit (₹) <span className="text-red-500">*</span></label>
                      <Input 
                        name="add_deposit" 
                        id="add_deposit" 
                        required
                        type="number" 
                        min="0"
                        placeholder="e.g. 5000" 
                        value={newStudent.deposit} 
                        onChange={(e) => setNewStudent({...newStudent, deposit: e.target.value})} 
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="add_monthlyFee" className="text-sm font-medium">Monthly Fee Rate (₹) <span className="text-red-500">*</span></label>
                      <Input 
                        name="add_monthlyFee" 
                        id="add_monthlyFee" 
                        required
                        type="number" 
                        min="1"
                        placeholder="e.g. 6000" 
                        value={newStudent.monthlyFee} 
                        onChange={(e) => setNewStudent({...newStudent, monthlyFee: e.target.value})} 
                      />
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

      {/* ================= EDIT STUDENT MODAL WITH TABS ================= */}
      <AnimatePresence>
        {isEditModalOpen && editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-card rounded-xl shadow-xl overflow-hidden border border-border max-h-[90vh] flex flex-col"
            >
              {/* Edit Modal Header */}
              <div className="p-5 border-b border-border flex justify-between items-center shrink-0">
                <div>
                  <h2 className="text-xl font-bold">Edit Student Profile</h2>
                  <p className="text-xs text-black/50 dark:text-white/50">{editingStudent.name} ({editingStudent.studentId})</p>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white" aria-label="Close edit modal">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs Switcher */}
              <div className="flex border-b border-border bg-black/[0.02] dark:bg-white/[0.02] px-6 pt-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditActiveTab('details')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                    editActiveTab === 'details'
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-black/50 dark:text-white/50 hover:text-foreground'
                  }`}
                >
                  <FileEdit className="w-4 h-4" /> Student Information
                </button>
                <button
                  type="button"
                  onClick={() => setEditActiveTab('password')}
                  className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                    editActiveTab === 'password'
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-black/50 dark:text-white/50 hover:text-foreground'
                  }`}
                >
                  <Key className="w-4 h-4" /> Change Password
                </button>
              </div>

              {/* Tab 1: Details Form */}
              {editActiveTab === 'details' && (
                <div className="overflow-y-auto p-6">
                  <form onSubmit={handleEditStudent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="edit_surname" className="text-sm font-medium">Surname <span className="text-red-500">*</span></label>
                        <Input name="edit_surname" id="edit_surname" required value={editingStudent.surname} onChange={(e) => setEditingStudent({...editingStudent, surname: e.target.value})} placeholder="e.g. Doe" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_name" className="text-sm font-medium">Student Name <span className="text-red-500">*</span></label>
                        <Input name="edit_name" id="edit_name" required value={editingStudent.name} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} placeholder="e.g. John" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_fatherName" className="text-sm font-medium">Father Name <span className="text-red-500">*</span></label>
                        <Input name="edit_fatherName" id="edit_fatherName" required value={editingStudent.fatherName} onChange={(e) => setEditingStudent({...editingStudent, fatherName: e.target.value})} placeholder="e.g. Richard" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_email" className="text-sm font-medium">Email Address (Optional)</label>
                        <Input name="edit_email" id="edit_email" type="email" value={editingStudent.email || ''} onChange={(e) => setEditingStudent({...editingStudent, email: e.target.value})} placeholder="e.g. student@example.com" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_phone" className="text-sm font-medium">Student Phone No. <span className="text-red-500">*</span></label>
                        <Input name="edit_phone" id="edit_phone" required type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={editingStudent.phone} onChange={(e) => setEditingStudent({...editingStudent, phone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_fatherPhone" className="text-sm font-medium">Father Phone No. <span className="text-red-500">*</span></label>
                        <Input name="edit_fatherPhone" id="edit_fatherPhone" required type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={editingStudent.fatherPhone} onChange={(e) => setEditingStudent({...editingStudent, fatherPhone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_motherPhone" className="text-sm font-medium">Mother Phone No. (Optional)</label>
                        <Input name="edit_motherPhone" id="edit_motherPhone" type="tel" pattern="[0-9]{10}" maxLength={10} minLength={10} title="Phone number must be exactly 10 digits" value={editingStudent.motherPhone} onChange={(e) => setEditingStudent({...editingStudent, motherPhone: e.target.value.replace(/\D/g, '')})} placeholder="10 digit mobile number" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_dob" className="text-sm font-medium">Date Of Birth <span className="text-red-500">*</span></label>
                        <Input name="edit_dob" id="edit_dob" required type="date" value={editingStudent.dob} onChange={(e) => setEditingStudent({...editingStudent, dob: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_village" className="text-sm font-medium">Village Name <span className="text-red-500">*</span></label>
                        <Input name="edit_village" id="edit_village" required value={editingStudent.village} onChange={(e) => setEditingStudent({...editingStudent, village: e.target.value})} placeholder="Village" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_taluka" className="text-sm font-medium">Taluka <span className="text-red-500">*</span></label>
                        <Input name="edit_taluka" id="edit_taluka" required value={editingStudent.taluka} onChange={(e) => setEditingStudent({...editingStudent, taluka: e.target.value})} placeholder="Taluka" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_district" className="text-sm font-medium">District <span className="text-red-500">*</span></label>
                        <Input name="edit_district" id="edit_district" required value={editingStudent.district} onChange={(e) => setEditingStudent({...editingStudent, district: e.target.value})} placeholder="District" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_pincode" className="text-sm font-medium">Pin Code (Optional)</label>
                        <Input name="edit_pincode" id="edit_pincode" value={editingStudent.pincode} onChange={(e) => setEditingStudent({...editingStudent, pincode: e.target.value})} placeholder="Pincode" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_school" className="text-sm font-medium">School Name <span className="text-red-500">*</span></label>
                        <Input name="edit_school" id="edit_school" required value={editingStudent.school} onChange={(e) => setEditingStudent({...editingStudent, school: e.target.value})} placeholder="School Name" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_college" className="text-sm font-medium">College Name (Optional)</label>
                        <Input name="edit_college" id="edit_college" value={editingStudent.college} onChange={(e) => setEditingStudent({...editingStudent, college: e.target.value})} placeholder="College Name" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_room" className="text-sm font-medium">Room Number <span className="text-red-500">*</span></label>
                        <select 
                          name="edit_room"
                          id="edit_room"
                          required 
                          value={editingStudent.room} 
                          onChange={(e) => setEditingStudent({...editingStudent, room: e.target.value})}
                          className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-black/40 dark:placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                        >
                          <option value="" className="text-black dark:text-black">Select Room</option>
                          {rooms.map(room => {
                            const currentStudentRoom = editingStudent.room || editingStudent.roomNumber;
                            const isCurrentRoom = room.roomNumber === currentStudentRoom;
                            const isFull = !isCurrentRoom && room.currentOccupants >= room.capacity;
                            const avail = isCurrentRoom ? (room.capacity - room.currentOccupants + 1) : (room.capacity - room.currentOccupants);
                            return (
                              <option 
                                key={room._id} 
                                value={room.roomNumber} 
                                disabled={isFull}
                                className="text-black dark:text-black"
                              >
                                Room {room.roomNumber} {isFull ? '(Full)' : `(Avail: ${avail})`}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_deposit" className="text-sm font-medium">Deposit (₹) <span className="text-red-500">*</span></label>
                        <Input 
                          name="edit_deposit" 
                          id="edit_deposit" 
                          required
                          type="number" 
                          min="0"
                          placeholder="e.g. 5000" 
                          value={editingStudent.deposit} 
                          onChange={(e) => setEditingStudent({...editingStudent, deposit: e.target.value})} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="edit_monthlyFee" className="text-sm font-medium">Monthly Fee Rate (₹) <span className="text-red-500">*</span></label>
                        <Input 
                          name="edit_monthlyFee" 
                          id="edit_monthlyFee" 
                          required
                          type="number" 
                          min="1"
                          placeholder="e.g. 6000" 
                          value={editingStudent.monthlyFee} 
                          onChange={(e) => setEditingStudent({...editingStudent, monthlyFee: e.target.value})} 
                        />
                      </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-border pt-6">
                      <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab 2: Change Password Form */}
              {editActiveTab === 'password' && (
                <div className="overflow-y-auto p-6 space-y-5">
                  <form onSubmit={handleEditPasswordTabSubmit} className="space-y-4 max-w-md mx-auto py-2">
                    <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 space-y-2">
                      <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <Key className="w-4 h-4" /> Current Password on Record:
                      </span>
                      <div className="font-mono text-sm font-bold text-foreground bg-card px-3 py-2 rounded-lg border border-border">
                        {editingStudent.userId?.rawPassword || editingStudent.rawPassword || 'password123'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="editTabNewPassword" className="text-xs font-semibold block text-foreground">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input 
                          id="editTabNewPassword"
                          name="editTabNewPassword"
                          type={showEditPassword ? "text" : "password"}
                          required
                          minLength={4}
                          placeholder="Enter new password (min 4 characters)"
                          value={editNewPassword}
                          onChange={(e) => setEditNewPassword(e.target.value)}
                          className="pr-10 h-11"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white"
                          tabIndex={-1}
                        >
                          {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setEditNewPassword('password123')}
                        className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        Reset to default password (password123)
                      </button>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border">
                      <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={editPasswordUpdating} className="font-semibold gap-2">
                        <Check className="w-4 h-4" /> {editPasswordUpdating ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentsList;
