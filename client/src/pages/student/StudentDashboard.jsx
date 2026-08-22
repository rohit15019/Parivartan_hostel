import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, Clock, MapPin, CalendarDays, ArrowRight, Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [fee, setFee] = useState(null);
  const [recentLeave, setRecentLeave] = useState(null);
  const [libraryData, setLibraryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, leaveRes, libraryRes] = await Promise.all([
          api.get('/students/profile'),
          api.get('/leaves/my'),
          api.get('/library/my-seat').catch(() => ({ data: null }))
        ]);
        
        setProfile(profileRes.data);
        if (libraryRes?.data) {
          setLibraryData(libraryRes.data);
        }
        
        if (leaveRes.data && leaveRes.data.length > 0) {
          setRecentLeave(leaveRes.data[0]);
        }

        if (profileRes.data && profileRes.data._id) {
          const feeRes = await api.get(`/fees/${profileRes.data._id}`);
          if (feeRes.data) {
            setFee(feeRes.data.fee || feeRes.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FULLY PAID':
      case 'PAID': return <Badge variant="success">🟢 FULLY PAID</Badge>;
      case 'HALF PAID':
      case 'PARTIALLY PAID': return <Badge variant="warning">🟡 PARTIALLY PAID</Badge>;
      case 'PENDING': return <Badge variant="danger">🔴 PENDING</Badge>;
      default: return <Badge>{status || 'N/A'}</Badge>;
    }
  };

  const totalFees = fee?.totalFees || 0;
  const paidAmount = fee?.paidAmount || 0;
  const remaining = Math.max(0, totalFees - paidAmount);
  const feeStatus = totalFees > 0 ? (paidAmount >= totalFees ? 'FULLY PAID' : paidAmount > 0 ? 'PARTIALLY PAID' : 'PENDING') : 'PENDING';
  const progressPercent = totalFees > 0 ? Math.min(100, Math.round((paidAmount / totalFees) * 100)) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {profile?.name || user?.email} 👋</h1>
        <div className="flex items-center gap-4 text-black/60 dark:text-white/60 font-medium">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Room {profile?.roomNumber || 'Not Assigned'}
          </div>
          <div className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20"></div>
          <div>Parivartan Hostel</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fees Overview Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="h-full bg-gradient-to-br from-primary-900 to-primary-800 text-white border-0 shadow-lg relative overflow-hidden flex flex-col justify-between">
             {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/20 rounded-full filter blur-3xl translate-y-1/3 -translate-x-1/3"></div>

            <CardContent className="p-7 relative z-10 flex flex-col h-full justify-between space-y-6">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Monthly Fee
                      </span>
                      <span className="text-xs text-primary-200">{fee?.currentMonthName || 'Current Month'}</span>
                    </div>
                    <h3 className="text-2xl font-bold mt-1">₹{Number(fee?.currentMonthFee || fee?.totalFees || 6000).toLocaleString()} / mo</h3>
                  </div>
                  <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md">
                    <IndianRupee className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-primary-200 text-[11px] font-medium mb-0.5">Previous Arrears</p>
                    <p className={`text-base font-bold ${Number(fee?.previousPendingDues || 0) > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                      ₹{Number(fee?.previousPendingDues || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-primary-200 text-[11px] font-medium mb-0.5">Total Balance Due</p>
                    <p className="text-base font-bold text-red-300">
                      ₹{Number(fee?.remainingAmount !== undefined ? fee.remainingAmount : remaining).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-primary-100 font-medium">
                    <span>Payment Progress (All Time)</span>
                    <span className="font-bold text-white">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {fee?.dueDate && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-primary-200">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due Date: {new Date(fee.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <div>
                   <p className="text-xs text-primary-200 mb-0.5">Fee Status</p>
                   {getStatusBadge(feeStatus)}
                </div>
                <Button variant="ghost" className="text-white hover:bg-white/10 gap-1.5 text-xs h-8 px-3" onClick={() => navigate('/student/fees')}>
                  Full Schedule & History <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leave Request Card & Status */}
        <div className="space-y-6 flex flex-col justify-between">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1">
            <Card className="h-full flex flex-col justify-between">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="w-5 h-5 text-primary-500" /> Recent Leave Request
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentLeave ? (
                  <div className="p-4 border border-border rounded-xl bg-black/5 dark:bg-white/5 space-y-3">
                    <div className="flex justify-between items-center text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <span>{new Date(recentLeave.fromDate).toLocaleDateString()}</span>
                        <span className="text-black/40 dark:text-white/40">→</span>
                        <span>{new Date(recentLeave.toDate).toLocaleDateString()}</span>
                      </div>
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-bold">{recentLeave.days} Days</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-sm">
                       <span className="text-xs text-black/50 dark:text-white/50 font-medium">Status:</span>
                       <div>
                          {recentLeave.status === 'APPROVED' ? (
                            <Badge variant="success">🟢 Approved</Badge>
                          ) : recentLeave.status === 'REJECTED' || recentLeave.status === 'DENIED' ? (
                            <Badge variant="danger">🔴 Rejected</Badge>
                          ) : (
                            <Badge variant="warning">🟡 Pending Approval</Badge>
                          )}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-black/50 dark:text-white/50 border border-dashed border-border rounded-xl">
                    No recent leave requests found.
                  </div>
                )}
                <Button className="w-full" variant="outline" onClick={() => navigate('/student/leaves')}>
                   Apply for New Leave
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-black/50 dark:text-white/50 font-medium">Hostel Residency Status</p>
                    <p className="text-sm font-bold text-foreground">
                      {recentLeave?.status === 'APPROVED' && new Date(recentLeave.fromDate) <= new Date() && new Date(recentLeave.toDate) >= new Date()
                        ? 'Currently on Leave'
                        : 'Currently in Hostel'}
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    recentLeave?.status === 'APPROVED' && new Date(recentLeave.fromDate) <= new Date() && new Date(recentLeave.toDate) >= new Date()
                      ? 'bg-amber-500'
                      : 'bg-green-500'
                  }`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card 
              className="cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors shadow-sm" 
              onClick={() => navigate('/student/library')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50 font-medium">Library Seat Allocation</p>
                    <p className="text-sm font-bold text-foreground">
                      {libraryData?.assignedSeat ? (
                        <span className="text-purple-600 dark:text-purple-400">Seat {libraryData.assignedSeat.seatNumber} ({libraryData.assignedSeat.section || 'Main Hall'})</span>
                      ) : (
                        <span className="text-black/70 dark:text-white/70">No Seat Allocated</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-semibold">
                  <span>View</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
