import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, IndianRupee, History, Pencil, CreditCard, Calendar, FileText, User } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

const FeeManagement = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [studentId, setStudentId] = useState(location.state?.studentId || '');
  const [student, setStudent] = useState(location.state?.student || null);
  
  const [feeData, setFeeData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    transactionId: '',
    notes: ''
  });

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchFeeDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/fees/${id}`);
      setFeeData(data.fee);
      setPayments(data.payments || []);
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to fetch fee details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchFeeDetails(studentId);
    }
  }, [studentId]);

  const selectStudent = (s) => {
    setStudentId(s._id || s.id);
    setStudent(s);
  };

  const filteredStudents = students.filter(s => {
    if (!studentSearch) return true;
    const lowerSearch = studentSearch.toLowerCase();
    return (s.name || '').toLowerCase().includes(lowerSearch) || 
           (s.studentId || '').toLowerCase().includes(lowerSearch);
  });

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!studentId || !paymentForm.amount) return;

    try {
      const { data } = await api.post(`/fees/${studentId}/payments`, paymentForm);
      alert('Payment recorded successfully!');
      
      // Refresh fee data
      fetchFeeDetails(studentId);
      
      // Reset form
      setPaymentForm({
        ...paymentForm,
        amount: '',
        transactionId: '',
        notes: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record payment');
    }
  };

  const remaining = feeData ? feeData.totalFees - feeData.paidAmount : 0;
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'FULLY PAID': return <Badge variant="success">🟢 FULLY PAID</Badge>;
      case 'PARTIALLY PAID': return <Badge variant="warning">🟡 PARTIALLY PAID</Badge>;
      case 'PENDING': return <Badge variant="danger">🔴 PENDING</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  let currentStatus = 'PENDING';
  if (feeData) {
    if (feeData.paidAmount >= feeData.totalFees && feeData.totalFees > 0) currentStatus = 'FULLY PAID';
    else if (feeData.paidAmount > 0) currentStatus = 'PARTIALLY PAID';
  }

  // Pagination logic
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment);
  const totalPages = Math.ceil(payments.length / paymentsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-black/60 dark:text-white/60">Manage student fees, record payments, and view history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-14rem)] min-h-[600px]">
        {/* Left Column: Students List */}
        <div className="lg:col-span-1 border border-border rounded-xl bg-card overflow-hidden flex flex-col h-full shadow-sm">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
              <Input 
                id="studentSearch"
                name="studentSearch"
                placeholder="Search students..." 
                className="pl-9 h-10 w-full"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto p-2 flex-1">
            {studentsLoading ? (
              <p className="text-center text-sm text-black/50 py-4">Loading students...</p>
            ) : filteredStudents.length === 0 ? (
              <p className="text-center text-sm text-black/50 py-4">No students found.</p>
            ) : (
              <div className="space-y-1">
                {filteredStudents.map(s => (
                  <button
                    key={s._id || s.id}
                    onClick={() => selectStudent(s)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${studentId === (s._id || s.id) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-900 dark:text-primary-100 font-medium' : 'hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0 text-xs font-bold">
                      {(s.name || 'U').charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <div className="truncate text-sm">{s.name}</div>
                      <div className="text-xs opacity-70 truncate">{s.studentId}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Fee Details */}
        <div className="lg:col-span-3 h-full overflow-y-auto pr-2 pb-10">
          {!studentId ? (
            <Card className="p-12 text-center h-full flex flex-col items-center justify-center text-black/50 dark:text-white/50 border-dashed">
              <User className="w-12 h-12 mb-4 opacity-20" />
              <p>Please select a student from the list to view and manage their fees.</p>
            </Card>
          ) : loading ? (
            <Card className="p-12 text-center h-full flex items-center justify-center text-black/50 dark:text-white/50">
              <p>Loading fee details...</p>
            </Card>
          ) : feeData ? (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-6">
              {/* Main Content */}
              <div className="xl:col-span-2 space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card>
                    <CardHeader className="pb-4 border-b border-border">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-2xl font-bold">
                              {(student?.name || 'U').charAt(0)}
                           </div>
                           <div>
                             <CardTitle className="text-xl">{student?.name || 'Student'}</CardTitle>
                             <CardDescription className="mt-1">
                               {student?.studentId || 'ID'} • Room {student?.roomNumber || student?.room || 'N/A'}
                             </CardDescription>
                           </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                        <div>
                          <p className="text-sm text-black/50 dark:text-white/50 font-medium mb-1">Total Fees</p>
                          <p className="text-2xl font-bold">₹{feeData.totalFees.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-black/50 dark:text-white/50 font-medium mb-1">Paid Amount</p>
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{feeData.paidAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-black/50 dark:text-white/50 font-medium mb-1">Remaining</p>
                          <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{remaining.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-medium text-black/70 dark:text-white/70">Payment Progress</span>
                          <span className="font-bold">{feeData.totalFees > 0 ? Math.round((feeData.paidAmount / feeData.totalFees) * 100) : 0}%</span>
                        </div>
                        <ProgressBar value={feeData.paidAmount} max={feeData.totalFees || 1} className="h-3" />
                        <div className="mt-2 text-right">
                          {getStatusBadge(currentStatus)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IndianRupee className="w-5 h-5 text-primary-500" /> Record New Payment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-4" onSubmit={handleRecordPayment}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="amount" className="text-sm font-medium">Amount Received (₹)</label>
                            <Input 
                              id="amount"
                              name="amount"
                              type="number" 
                              placeholder="e.g. 15000" 
                              required 
                              value={paymentForm.amount}
                              onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="paymentDate" className="text-sm font-medium">Payment Date</label>
                            <Input 
                              id="paymentDate"
                              name="paymentDate"
                              type="date" 
                              required
                              value={paymentForm.paymentDate}
                              onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="paymentMethod" className="text-sm font-medium">Payment Method</label>
                            <select 
                              id="paymentMethod"
                              name="paymentMethod"
                              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              value={paymentForm.paymentMethod}
                              onChange={(e) => setPaymentForm({...paymentForm, paymentMethod: e.target.value})}
                            >
                              <option>Cash</option>
                              <option>UPI</option>
                              <option>Bank Transfer</option>
                              <option>Cheque</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="transactionId" className="text-sm font-medium">Transaction / Ref Number</label>
                            <Input 
                              id="transactionId"
                              name="transactionId"
                              type="text" 
                              placeholder="Optional" 
                              value={paymentForm.transactionId}
                              onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})}
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full sm:w-auto mt-4 gap-2">
                          Confirm Payment
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar: Payment History */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="h-full min-h-[400px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <History className="w-5 h-5 text-primary-500" /> History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {payments.length === 0 ? (
                      <p className="text-sm text-black/50 dark:text-white/50 text-center py-4">No payments yet.</p>
                    ) : (
                      <>
                        <div className="relative border-l-2 border-primary-100 dark:border-primary-900/50 ml-3 space-y-6 pb-4">
                          {currentPayments.map((payment) => (
                            <div key={payment._id} className="relative pl-6">
                              {/* Timeline Dot */}
                              <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary-500 ring-4 ring-card"></span>
                              
                              <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-black/50 dark:text-white/50">
                                  {new Date(payment.paymentDate).toLocaleDateString()}
                                </span>
                                <span className="text-base font-bold text-green-600 dark:text-green-400">₹{payment.amount.toLocaleString()}</span>
                                <div className="flex flex-col gap-0.5 text-xs text-black/60 dark:text-white/60 mt-1">
                                  <span className="flex items-center gap-1"><CreditCard className="w-3 h-3"/> {payment.paymentMethod}</span>
                                  {payment.transactionId && <span className="flex items-center gap-1"><FileText className="w-3 h-3"/> {payment.transactionId}</span>}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                              Previous
                            </Button>
                            <span className="text-xs text-black/60 dark:text-white/60">
                              Page {currentPage} of {totalPages}
                            </span>
                            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                              Next
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;
