import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  History, 
  CreditCard, 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers, 
  AlertCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const StudentFees = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pagination state for Payment Transactions (5 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const paymentsPerPage = 5;

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const { data: profileData } = await api.get('/students/profile');
        setProfile(profileData);
        
        if (profileData && profileData._id) {
          const { data } = await api.get(`/fees/${profileData._id}`);
          setFeeData(data);
        }
      } catch (error) {
        console.error('Failed to fetch fee data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchFees();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-sm text-black/50">Loading fee details...</div>;
  if (!profile || !feeData) return <div className="p-8 text-center text-sm text-black/50">No fee records found.</div>;

  const currentMonth = feeData.currentMonth || null;
  const previousPending = feeData.previousPendingDues || 0;
  const previousUnpaidMonths = feeData.previousUnpaidMonths || [];
  const totalOutstanding = feeData.totalPendingBalance || 0;
  const monthlyBreakdown = feeData.monthlyBreakdown || [];
  const payments = feeData.payments || [];

  const currentMonthAmount = currentMonth ? (Number(currentMonth.amount) || 0) : 6000;
  const currentMonthPaid = currentMonth ? (Number(currentMonth.paidAmount) || 0) : 0;
  const currentMonthRemaining = currentMonth ? Math.max(0, currentMonthAmount - currentMonthPaid) : 0;
  const currentMonthName = currentMonth?.monthName || 'Current Month';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
      case 'FULLY PAID':
        return <Badge variant="success">🟢 PAID</Badge>;
      case 'PARTIALLY PAID':
      case 'HALF PAID':
        return <Badge variant="warning">🟡 PARTIAL</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="danger">🔴 PENDING</Badge>;
    }
  };

  // Pagination logic for payments
  const totalPages = Math.ceil(payments.length / paymentsPerPage);
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;
  const currentPayments = payments.slice(indexOfFirstPayment, indexOfLastPayment);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 rounded-2xl bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-900 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Monthly Fee Cycle
            </span>
            <span className="text-xs text-primary-200">Auto-renewed on 1st of every month</span>
          </div>
          <h1 className="text-2xl font-bold mt-1.5 flex items-center gap-2.5">
            <IndianRupee className="w-6 h-6 text-primary-300" />
            My Hostel Fees & Billing Schedule
          </h1>
          <p className="text-xs text-primary-100/80 mt-0.5">
            Hostel fee is billed monthly. Any unpaid past dues are carried forward alongside the current month.
          </p>
        </div>
      </div>

      {/* Warning Alert if Previous Unpaid Dues Exist */}
      {previousPending > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 flex items-start gap-3.5 shadow-sm"
        >
          <div className="p-2 rounded-xl bg-red-500/20 text-red-600 dark:text-red-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-red-800 dark:text-red-200">
              Action Required: Pending Dues From Previous Months
            </h4>
            <p className="text-red-700/90 dark:text-red-300/90 leading-relaxed">
              You have an outstanding backlog of <strong>₹{previousPending.toLocaleString()}</strong> from previous billing cycles ({previousUnpaidMonths.map(m => m.monthName).join(', ')}). 
              Please clear your past arrears along with your current month's fee of ₹{currentMonthAmount.toLocaleString()}.
            </p>
          </div>
        </motion.div>
      )}

      {/* 3 Prominent Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. Current Month Fee */}
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
              ₹{currentMonthAmount.toLocaleString()}
            </h3>
            <div className="flex justify-between items-center text-xs text-blue-900/70 dark:text-blue-200/70 mt-1">
              <span>Paid: ₹{currentMonthPaid.toLocaleString()}</span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                Due: ₹{currentMonthRemaining.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* 2. Previous Pending Dues */}
        <Card className={`p-4 ${previousPending > 0 ? 'bg-gradient-to-br from-red-50 to-amber-50/50 dark:from-red-950/30 dark:to-amber-950/20 border-red-300 dark:border-red-900/50' : 'bg-black/5 dark:bg-white/5 border-border'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${previousPending > 0 ? 'text-red-700 dark:text-red-400' : 'text-black/60 dark:text-white/60'}`}>
              <AlertTriangle className="w-3.5 h-3.5" /> Previous Pending Dues
            </span>
            {previousPending > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300">
                Arrears
              </span>
            ) : (
              <Badge variant="success" className="text-[10px]">Zero</Badge>
            )}
          </div>
          <div className="mt-2.5">
            <h3 className={`text-2xl font-black ${previousPending > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              ₹{previousPending.toLocaleString()}
            </h3>
            <p className="text-xs text-black/50 dark:text-white/50 mt-1">
              {previousPending > 0 ? `${previousUnpaidMonths.length} past cycle(s) unpaid` : 'No past arrears'}
            </p>
          </div>
        </Card>

        {/* 3. Total Balance Due */}
        <Card className="p-4 bg-gradient-to-br from-primary-900 to-indigo-950 text-white border-0 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full filter blur-lg pointer-events-none"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary-200 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-amber-300" /> Total Balance Due
            </span>
            {totalOutstanding === 0 ? (
              <Badge variant="success" className="text-[10px]">All Clear</Badge>
            ) : (
              <Badge variant="danger" className="text-[10px]">Pending</Badge>
            )}
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-white">
              ₹{totalOutstanding.toLocaleString()}
            </h3>
            <p className="text-xs text-primary-200/80 mt-1">
              Current (₹{currentMonthRemaining.toLocaleString()}) + Arrears (₹{previousPending.toLocaleString()})
            </p>
          </div>
        </Card>
      </div>

      {/* Month-by-Month Fee Schedule Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border overflow-hidden">
          <CardHeader className="p-4 border-b border-border bg-black/[0.02] dark:bg-white/[0.02] flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary-600" /> Monthly Fee Billing Ledger
              </CardTitle>
              <CardDescription className="text-xs">
                Detailed record of monthly fee renewals, payments, and due dates.
              </CardDescription>
            </div>
            <span className="text-xs text-black/50 dark:text-white/50 font-medium">
              {monthlyBreakdown.length} Month Cycles
            </span>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-black/5 dark:bg-white/5 uppercase text-black/60 dark:text-white/60 font-semibold border-b border-border">
                <tr>
                  <th className="px-4 py-3">Billing Cycle / Month</th>
                  <th className="px-4 py-3">Fee Amount</th>
                  <th className="px-4 py-3">Amount Paid</th>
                  <th className="px-4 py-3">Pending Due</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monthlyBreakdown.map((mf) => {
                  const isCurrent = mf.monthYear === (currentMonth?.monthYear);
                  const remaining = Math.max(0, (Number(mf.amount) || 0) - (Number(mf.paidAmount) || 0));
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
                              Current
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
      </motion.div>

      {/* Payment Transactions Receipts */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border">
          <CardHeader className="pb-4 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <History className="w-4 h-4 text-primary-500" /> Payment Receipts History
            </CardTitle>
            {payments.length > 0 && (
              <span className="text-xs text-black/50 dark:text-white/50 font-medium">
                Total: {payments.length} receipt{payments.length === 1 ? '' : 's'}
              </span>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative border-l-2 border-primary-100 dark:border-primary-900/50 ml-3 space-y-4 pb-2">
              {payments && payments.length > 0 ? (
                currentPayments.map((payment, idx) => (
                  <div key={payment._id || idx} className="relative pl-6">
                    {/* Timeline Dot */}
                    <span className="absolute -left-[9px] top-4 h-4 w-4 rounded-full bg-primary-500 ring-4 ring-card"></span>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-black/5 dark:bg-white/5 border border-border/60 hover:bg-black/[0.07] dark:hover:bg-white/[0.07] transition-colors">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-black/80 dark:text-white/80">
                          {new Date(payment.paymentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex flex-wrap items-center gap-2.5 text-xs text-black/60 dark:text-white/60">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                            <CreditCard className="w-3 h-3"/> {payment.paymentMethod}
                          </span>
                          {payment.transactionId && (
                            <span className="flex items-center gap-1 font-mono text-[11px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded border border-border/50">
                              <FileText className="w-3 h-3"/> Ref: {payment.transactionId}
                            </span>
                          )}
                        </div>
                        {payment.notes && (
                          <p className="text-[11px] text-black/50 dark:text-white/50 italic mt-0.5">
                            Note: {payment.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-base font-bold text-green-600 dark:text-green-400">
                          + ₹{payment.amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-black/50 dark:text-white/50 pl-4 py-6 text-center">
                  No payment transactions recorded yet.
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-border text-xs">
                <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                  Previous
                </Button>
                <span className="text-black/60 dark:text-white/60 font-medium">
                  Page {currentPage} of {totalPages}
                </span>
                <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentFees;
