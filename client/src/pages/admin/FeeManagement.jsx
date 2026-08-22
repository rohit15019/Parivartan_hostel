import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  IndianRupee, 
  History, 
  CreditCard, 
  Calendar, 
  FileText, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  Edit3, 
  ChevronRight,
  Layers,
  Sparkles,
  X
} from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';

const FeeManagement = () => {
  const location = useLocation();
  const [studentSearch, setStudentSearch] = useState('');
  
  const [studentFeesList, setStudentFeesList] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [selectedStudentId, setSelectedStudentId] = useState(location.state?.studentId || '');
  const [studentDetail, setStudentDetail] = useState(location.state?.student || null);
  
  // Full monthly fee data response
  const [feeDetails, setFeeDetails] = useState(null);
  const [loadingFee, setLoadingFee] = useState(false);
  const [activeTab, setActiveTab] = useState('breakdown'); // 'breakdown' | 'payments' | 'record'

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash',
    transactionId: '',
    notes: ''
  });

  // Edit Rate Modal
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [editRateForm, setEditRateForm] = useState({
    monthlyFee: 6000,
    feeDueDay: 10
  });

  // Refresh all students fees state
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState(null);

  // Fetch all student fees for sidebar
  const fetchAllStudentFees = async () => {
    try {
      setStudentsLoading(true);
      const { data } = await api.get('/fees/student-fees');
      setStudentFeesList(data || []);
      
      // Auto-select first student if none selected
      if (!selectedStudentId && data && data.length > 0) {
        setSelectedStudentId(data[0].student._id || data[0].student.id);
        setStudentDetail(data[0].student);
      }
    } catch (error) {
      console.error('Failed to fetch student fees:', error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleRefreshAllFees = async () => {
    setRefreshingAll(true);
    setRefreshMessage(null);
    try {
      const res = await api.post('/fees/auto-renew');
      await fetchAllStudentFees();
      if (selectedStudentId) {
        await fetchStudentFeeDetails(selectedStudentId);
      }
      setRefreshMessage(res.data?.message || 'Monthly fees refreshed for all students successfully!');
      setTimeout(() => setRefreshMessage(null), 5000);
    } catch (error) {
      console.error('Failed to refresh fees for all students:', error);
      alert(error.response?.data?.message || 'Failed to refresh fees');
    } finally {
      setRefreshingAll(false);
    }
  };

  useEffect(() => {
    fetchAllStudentFees();
  }, []);

  // Fetch specific student fee details
  const fetchStudentFeeDetails = async (id) => {
    if (!id) return;
    setLoadingFee(true);
    try {
      const { data } = await api.get(`/fees/${id}`);
      setFeeDetails(data);
      if (data.student) {
        setStudentDetail(data.student);
        setEditRateForm({
          monthlyFee: data.student.monthlyFee || 6000,
          feeDueDay: data.student.feeDueDay || 10
        });
      }
      setCurrentPaymentPage(1);
    } catch (error) {
      console.error('Failed to fetch fee details:', error);
    } finally {
      setLoadingFee(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentFeeDetails(selectedStudentId);
    }
  }, [selectedStudentId]);

  const selectStudent = (item) => {
    const sId = item.student._id || item.student.id;
    setSelectedStudentId(sId);
    setStudentDetail(item.student);
  };

  // Filter students in sidebar
  const filteredStudentFees = studentFeesList.filter(item => {
    if (!studentSearch) return true;
    const lower = studentSearch.toLowerCase();
    const s = item.student;
    return (s.name || '').toLowerCase().includes(lower) || 
           (s.surname || '').toLowerCase().includes(lower) || 
           (s.studentId || '').toLowerCase().includes(lower) ||
           (s.roomNumber || '').toLowerCase().includes(lower);
  });

  // Handle Record Payment
  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudentId || !paymentForm.amount) return;

    try {
      const res = await api.post(`/fees/${selectedStudentId}/payments`, paymentForm);
      alert(res.data?.message || 'Payment recorded successfully!');
      
      // Refresh current details & sidebar
      fetchStudentFeeDetails(selectedStudentId);
      fetchAllStudentFees();
      
      // Reset form
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        transactionId: '',
        notes: ''
      });
      setActiveTab('breakdown');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to record payment');
    }
  };

  // Handle Save Monthly Rate
  const handleSaveMonthlyRate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/fees/${selectedStudentId}`, {
        monthlyFee: Number(editRateForm.monthlyFee),
        feeDueDay: Number(editRateForm.feeDueDay),
        updateCurrentMonth: true
      });
      alert('Monthly fee rate updated successfully!');
      setIsRateModalOpen(false);
      fetchStudentFeeDetails(selectedStudentId);
      fetchAllStudentFees();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update rate');
    }
  };

  // Helper status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
      case 'FULLY PAID':
        return <Badge variant="success">🟢 PAID</Badge>;
      case 'PARTIALLY PAID':
        return <Badge variant="warning">🟡 PARTIAL</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="danger">🔴 PENDING</Badge>;
    }
  };

  // Current Month Data
  const currentMonth = feeDetails?.currentMonth || null;
  const previousPending = feeDetails?.previousPendingDues || 0;
  const totalOutstanding = feeDetails?.totalPendingBalance || 0;
  const currentMonthRemaining = currentMonth ? Math.max(0, currentMonth.amount - currentMonth.paidAmount) : 0;
  const currentMonthName = currentMonth?.monthName || 'Current Month';

  // Monthly Breakdown
  const monthlyBreakdown = feeDetails?.monthlyBreakdown || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Monthly Renewal Status Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 p-5 rounded-2xl text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Auto-Renew Monthly Active
            </span>
            <span className="text-xs text-primary-200">Cycle: 1st of every month</span>
          </div>
          <h1 className="text-2xl font-bold mt-1.5 flex items-center gap-2.5">
            <IndianRupee className="w-6 h-6 text-primary-300" />
            Monthly Fees & Arrears Management
          </h1>
          <p className="text-xs text-primary-100/80 mt-0.5">
            Automatic monthly fee renewals with full previous unpaid dues calculation and tracking.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
          {refreshMessage && (
            <motion.span 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> {refreshMessage}
            </motion.span>
          )}

          <Button
            onClick={handleRefreshAllFees}
            disabled={refreshingAll}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl gap-2 font-semibold shadow-sm text-xs sm:text-sm h-10 px-4 cursor-pointer transition-all hover:scale-105"
            title="Recalculate, generate current month cycles, and refresh fees for all students"
          >
            <RefreshCw className={`w-4 h-4 ${refreshingAll ? 'animate-spin' : ''}`} />
            <span>{refreshingAll ? 'Refreshing Fees...' : 'Refresh All Student Fees'}</span>
          </Button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[600px]">
        {/* Left Column: Students Directory & Dues Overview */}
        <div className="lg:col-span-1 border border-border rounded-2xl bg-card overflow-hidden flex flex-col h-full shadow-sm max-h-[800px]">
          <div className="p-4 border-b border-border bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
              <Input 
                id="studentSearch"
                name="studentSearch"
                placeholder="Search by name, ID, room..." 
                className="pl-9 h-10 w-full text-xs"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-black/50 dark:text-white/50 mt-2 px-1 font-medium">
              <span>{filteredStudentFees.length} Students</span>
              <span>Sorted by Name</span>
            </div>
          </div>

          <div className="overflow-y-auto p-2 flex-1 space-y-1">
            {studentsLoading ? (
              <p className="text-center text-xs text-black/50 py-8">Loading students...</p>
            ) : filteredStudentFees.length === 0 ? (
              <p className="text-center text-xs text-black/50 py-8">No students found.</p>
            ) : (
              filteredStudentFees.map(item => {
                const s = item.student;
                const sId = s._id || s.id;
                const isSelected = selectedStudentId === sId;
                const pending = item.totalPendingBalance || 0;
                const hasArrears = (item.previousPendingDues || 0) > 0;

                return (
                  <button
                    key={sId}
                    onClick={() => selectStudent(item)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-2 border ${
                      isSelected 
                        ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500/40 shadow-xs' 
                        : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {s.photo ? (
                        <img 
                          src={s.photo} 
                          alt={s.name} 
                          className="w-9 h-9 rounded-xl object-cover border border-border shrink-0" 
                        />
                      ) : (
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                          isSelected 
                            ? 'bg-primary-600 text-white shadow-sm' 
                            : 'bg-black/5 dark:bg-white/10 text-foreground'
                        }`}>
                          {(s.name || 'U').charAt(0)}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <div className="truncate text-xs font-semibold text-foreground">
                          {s.name} {s.surname || ''}
                        </div>
                        <div className="text-[11px] text-black/50 dark:text-white/50 truncate flex items-center gap-1.5">
                          <span>{s.studentId}</span>
                          <span>•</span>
                          <span>Room {s.roomNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {pending > 0 ? (
                        <div>
                          <span className={`text-xs font-bold ${hasArrears ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            ₹{pending.toLocaleString()}
                          </span>
                          {hasArrears && (
                            <span className="block text-[9px] font-semibold text-red-500 uppercase tracking-tighter">
                              +Arrears
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded-md">
                          Paid
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Student's Detailed Monthly Ledger & Actions */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedStudentId ? (
            <Card className="p-12 text-center h-full flex flex-col items-center justify-center text-black/50 dark:text-white/50 border-dashed">
              <User className="w-12 h-12 mb-4 opacity-20" />
              <p>Please select a student from the list to view and manage their monthly fees.</p>
            </Card>
          ) : loadingFee && !feeDetails ? (
            <Card className="p-12 text-center h-full flex items-center justify-center text-black/50 dark:text-white/50">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-primary-500" />
                <p>Loading monthly fee records...</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Student Top Profile Bar & Rate Setting */}
              <Card className="p-5 border-border">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-4">
                    {studentDetail?.photo ? (
                      <img 
                        src={studentDetail.photo} 
                        alt={studentDetail.name} 
                        className="w-14 h-14 rounded-2xl object-cover border border-border shadow-md shrink-0" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-700 text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                        {(studentDetail?.name || 'U').charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-extrabold text-foreground">
                          {studentDetail?.name} {studentDetail?.surname || ''}
                        </h2>
                        <Badge variant="outline" className="text-xs font-mono">
                          {studentDetail?.studentId}
                        </Badge>
                      </div>
                      <p className="text-xs text-black/60 dark:text-white/60 mt-0.5 flex flex-wrap items-center gap-2">
                        <span>Room {studentDetail?.roomNumber || 'N/A'}</span>
                        <span>•</span>
                        <span>{studentDetail?.phone || 'No Phone'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-2.5 rounded-xl border border-border">
                    <div className="text-right">
                      <span className="block text-[10px] uppercase font-bold text-black/50 dark:text-white/50">Monthly Rate</span>
                      <span className="text-sm font-extrabold text-primary-600 dark:text-primary-400">
                        ₹{Number(studentDetail?.monthlyFee || 6000).toLocaleString()} / mo
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsRateModalOpen(true)}
                      className="h-8 px-2.5 text-xs gap-1 border-border"
                      title="Adjust Monthly Fee Rate"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Rate
                    </Button>
                  </div>
                </div>
              </Card>

              {/* 3 Prominent Metric Cards: Current Month, Previous Arrears, Total Outstanding */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Current Month Fee Card */}
                <Card className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20 border-blue-200 dark:border-blue-900/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {currentMonthName}
                    </span>
                    <Badge variant={currentMonthRemaining === 0 ? 'success' : 'outline'} className="text-[10px]">
                      {currentMonthRemaining === 0 ? 'Paid' : 'Current Month'}
                    </Badge>
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-2xl font-black text-blue-950 dark:text-blue-100">
                      ₹{Number(currentMonth?.amount || 6000).toLocaleString()}
                    </h3>
                    <div className="flex justify-between items-center text-xs text-blue-900/70 dark:text-blue-200/70 mt-1">
                      <span>Paid: ₹{Number(currentMonth?.paidAmount || 0).toLocaleString()}</span>
                      <span className="font-semibold text-blue-700 dark:text-blue-300">
                        Due: ₹{currentMonthRemaining.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* 2. Previous Months Pending Dues (Arrears) Card */}
                <Card className={`p-4 ${previousPending > 0 ? 'bg-gradient-to-br from-red-50 to-amber-50/50 dark:from-red-950/30 dark:to-amber-950/20 border-red-300 dark:border-red-900/50 shadow-xs' : 'bg-black/5 dark:bg-white/5 border-border'}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${previousPending > 0 ? 'text-red-700 dark:text-red-400' : 'text-black/60 dark:text-white/60'}`}>
                      <AlertTriangle className="w-3.5 h-3.5" /> Previous Pending Dues
                    </span>
                    {previousPending > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 animate-pulse">
                        Unpaid Arrears
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <h3 className={`text-2xl font-black ${previousPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      ₹{previousPending.toLocaleString()}
                    </h3>
                    <p className="text-xs text-black/50 dark:text-white/50 mt-1">
                      {previousPending > 0 
                        ? `${feeDetails?.previousUnpaidMonths?.length || 0} previous month(s) pending` 
                        : 'No pending backlog from past months'}
                    </p>
                  </div>
                </Card>

                {/* 3. Total Outstanding Payable Card */}
                <Card className="p-4 bg-gradient-to-br from-primary-900 to-indigo-950 text-white border-0 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full filter blur-lg pointer-events-none"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-200 flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-300" /> Total Balance Due
                    </span>
                    {totalOutstanding === 0 ? (
                      <Badge variant="success" className="text-[10px]">Clear</Badge>
                    ) : (
                      <Badge variant="danger" className="text-[10px]">Action Needed</Badge>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <h3 className="text-2xl font-black text-white">
                      ₹{totalOutstanding.toLocaleString()}
                    </h3>
                    <p className="text-xs text-primary-200/80 mt-1">
                      Current Month (₹{currentMonthRemaining.toLocaleString()}) + Arrears (₹{previousPending.toLocaleString()})
                    </p>
                  </div>
                </Card>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-border gap-2">
                <button
                  onClick={() => setActiveTab('breakdown')}
                  className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'breakdown'
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-black/50 dark:text-white/50 hover:text-foreground'
                  }`}
                >
                  <Layers className="w-4 h-4" /> Month-by-Month Fee Schedule ({monthlyBreakdown.length} Months)
                </button>
                <button
                  onClick={() => setActiveTab('record')}
                  className={`pb-2.5 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
                    activeTab === 'record'
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-black/50 dark:text-white/50 hover:text-foreground'
                  }`}
                >
                  <CreditCard className="w-4 h-4" /> Record Payment
                </button>
              </div>

              {/* Tab 1: Month-by-Month Fee Schedule Table */}
              {activeTab === 'breakdown' && (
                <Card className="overflow-hidden border-border">
                  <CardHeader className="p-4 border-b border-border bg-black/[0.02] dark:bg-white/[0.02] flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold">Monthly Billing Ledger</CardTitle>
                      <CardDescription className="text-xs">
                        Chronological record of monthly renewed fees and payment allocations.
                      </CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => setActiveTab('record')} 
                      className="gap-1.5 text-xs h-8"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay Due Fees
                    </Button>
                  </CardHeader>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-black/5 dark:bg-white/5 uppercase text-black/60 dark:text-white/60 font-semibold border-b border-border">
                        <tr>
                          <th className="px-4 py-3">Billing Cycle / Month</th>
                          <th className="px-4 py-3">Monthly Fee</th>
                          <th className="px-4 py-3">Amount Paid</th>
                          <th className="px-4 py-3">Pending Due</th>
                          <th className="px-4 py-3">Due Date</th>
                          <th className="px-4 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {monthlyBreakdown.map((mf) => {
                          const isCurrent = mf.monthYear === (currentMonth?.monthYear);
                          const remaining = Math.max(0, (mf.amount || 0) - (mf.paidAmount || 0));
                          const isPastUnpaid = !isCurrent && remaining > 0;

                          return (
                            <tr 
                              key={mf._id} 
                              className={`transition-colors ${
                                isCurrent 
                                  ? 'bg-blue-50/40 dark:bg-blue-950/20 font-medium' 
                                  : isPastUnpaid 
                                  ? 'bg-red-50/30 dark:bg-red-950/10' 
                                  : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                              }`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-foreground">{mf.monthName}</span>
                                  {isCurrent && (
                                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold px-1.5 py-0.5 rounded">
                                      Active Cycle
                                    </span>
                                  )}
                                  {isPastUnpaid && (
                                    <span className="text-[10px] bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 font-semibold px-1.5 py-0.5 rounded">
                                      Arrear
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold text-foreground">
                                ₹{Number(mf.amount).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">
                                ₹{Number(mf.paidAmount || 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                {remaining > 0 ? (
                                  <span className="font-bold text-red-600 dark:text-red-400">
                                    ₹{remaining.toLocaleString()}
                                  </span>
                                ) : (
                                  <span className="text-black/40 dark:text-white/40 font-medium">
                                    ₹0 (Cleared)
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-black/60 dark:text-white/60">
                                {mf.dueDate ? new Date(mf.dueDate).toLocaleDateString() : 'N/A'}
                              </td>
                              <td className="px-4 py-3">
                                {getStatusBadge(mf.status)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}

              {/* Tab 2: Record Payment Form */}
              {activeTab === 'record' && (
                <Card className="border-border">
                  <CardHeader className="p-5 border-b border-border bg-gradient-to-r from-primary-50/50 to-indigo-50/30 dark:from-primary-950/20 dark:to-indigo-950/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">Record Student Payment</CardTitle>
                        <CardDescription className="text-xs">
                          Payments are automatically allocated to the oldest unpaid months first (clearing arrears), then applied to the active month.
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5">
                    {/* Summary Reminder Box */}
                    <div className="p-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-border mb-5 flex flex-wrap justify-between items-center gap-3 text-xs">
                      <div>
                        <span className="text-black/50 dark:text-white/50 block">Current Total Balance Due:</span>
                        <strong className="text-base text-red-600 dark:text-red-400">₹{totalOutstanding.toLocaleString()}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-black/50 dark:text-white/50 block">Previous Backlog Dues:</span>
                        <strong className="text-amber-600 dark:text-amber-400">₹{previousPending.toLocaleString()}</strong>
                      </div>
                    </div>

                    <form onSubmit={handleRecordPayment} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold block text-foreground">
                            Payment Amount (₹) *
                          </label>
                          <Input 
                            type="number"
                            min="1"
                            placeholder="e.g. 6000"
                            required
                            value={paymentForm.amount}
                            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                            className="h-10 text-sm font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold block text-foreground">
                            Payment Date *
                          </label>
                          <Input 
                            type="date"
                            required
                            value={paymentForm.paymentDate}
                            onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                            className="h-10 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold block text-foreground">
                            Payment Method *
                          </label>
                          <select
                            value={paymentForm.paymentMethod}
                            onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                            className="w-full h-10 px-3 text-xs rounded-xl border border-border bg-background"
                          >
                            <option value="Cash">Cash</option>
                            <option value="UPI">UPI / QR Code</option>
                            <option value="Bank Transfer">Bank Transfer / NEFT</option>
                            <option value="Cheque">Cheque</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold block text-foreground">
                            Transaction / Ref Number
                          </label>
                          <Input 
                            placeholder="e.g. UPI Ref: 329182391283"
                            value={paymentForm.transactionId}
                            onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                            className="h-10 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold block text-foreground">
                          Notes / Remarks (Optional)
                        </label>
                        <Input 
                          placeholder="e.g. Paid in cash by student father"
                          value={paymentForm.notes}
                          onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                          className="h-10 text-xs"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setActiveTab('breakdown')}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="font-semibold gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Confirm & Record Payment
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Rate Modal */}
      <AnimatePresence>
        {isRateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-primary-600" />
                  Adjust Monthly Fee Rate
                </h3>
                <button 
                  onClick={() => setIsRateModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-black/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMonthlyRate} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Monthly Fee Rate (₹) *</label>
                  <Input 
                    type="number"
                    min="0"
                    required
                    value={editRateForm.monthlyFee}
                    onChange={(e) => setEditRateForm({ ...editRateForm, monthlyFee: e.target.value })}
                  />
                  <span className="text-[11px] text-black/50 dark:text-white/50 block mt-1">
                    Standard monthly fee rate for this student.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold block mb-1">Fee Due Day of Month *</label>
                  <Input 
                    type="number"
                    min="1"
                    max="28"
                    required
                    value={editRateForm.feeDueDay}
                    onChange={(e) => setEditRateForm({ ...editRateForm, feeDueDay: e.target.value })}
                  />
                  <span className="text-[11px] text-black/50 dark:text-white/50 block mt-1">
                    Day of the month the fee is due (1 to 28).
                  </span>
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setIsRateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="font-semibold">
                    Save Changes
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

export default FeeManagement;
