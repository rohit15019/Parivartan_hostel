import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, Clock, MapPin, CalendarDays, ArrowRight } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileRes, leaveRes] = await Promise.all([
          api.get('/students/profile'),
          api.get('/leaves/my')
        ]);
        
        setProfile(profileRes.data);
        
        if (leaveRes.data && leaveRes.data.length > 0) {
          // Assuming the backend returns them sorted, or just take the first one
          setRecentLeave(leaveRes.data[0]);
        }

        if (profileRes.data && profileRes.data._id) {
          const feeRes = await api.get(`/fees/${profileRes.data._id}`);
          setFee(feeRes.data);
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
      case 'PAID': return <Badge variant="success">🟢 PAID</Badge>;
      case 'HALF PAID': return <Badge variant="warning">🟡 HALF PAID</Badge>;
      case 'PENDING': return <Badge variant="danger">🔴 PENDING</Badge>;
      default: return <Badge>{status || 'N/A'}</Badge>;
    }
  };

  const totalFees = fee?.totalFees || 0;
  const paidAmount = fee?.paidAmount || 0;
  const remaining = totalFees - paidAmount;
  const feeStatus = totalFees > 0 ? (paidAmount >= totalFees ? 'PAID' : paidAmount > 0 ? 'HALF PAID' : 'PENDING') : 'PENDING';
  const progressPercent = totalFees > 0 ? Math.round((paidAmount / totalFees) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {profile?.name || user?.email} 👋</h1>
        <div className="flex items-center gap-4 text-black/60 dark:text-white/60 font-medium">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" /> Room {profile?.roomNumber || 'Not Assigned'}
          </div>
          <div className="w-1 h-1 rounded-full bg-black/20 dark:bg-white/20"></div>
          <div>Parivartana 1</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fees Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="h-full bg-gradient-to-br from-primary-900 to-primary-800 text-white border-0 shadow-lg relative overflow-hidden">
             {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-500/20 rounded-full filter blur-3xl translate-y-1/3 -translate-x-1/3"></div>

            <CardContent className="p-8 relative z-10 flex flex-col h-full justify-between space-y-8">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-primary-100 font-medium mb-1">Total Fees</p>
                    <h3 className="text-3xl font-bold">₹{totalFees.toLocaleString()}</h3>
                  </div>
                  <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                    <IndianRupee className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-primary-200 text-sm mb-1">Paid Amount</p>
                    <p className="text-xl font-bold">₹{paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-primary-200 text-sm mb-1">Remaining</p>
                    <p className="text-xl font-bold">₹{remaining.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-primary-100">Payment Progress</span>
                    <span className="font-bold">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white transition-all"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                   <p className="text-sm text-primary-200 mb-1">Status</p>
                   {getStatusBadge(feeStatus)}
                </div>
                <Button variant="ghost" className="text-white hover:bg-white/10 gap-2" onClick={() => navigate('/student/fees')}>
                  View History <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leave Request Card & Status */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary-500" /> Recent Leave Request
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentLeave ? (
                  <div className="p-4 border border-border rounded-xl bg-black/5 dark:bg-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 font-medium">
                        <span>{new Date(recentLeave.fromDate).toLocaleDateString()}</span>
                        <span className="text-black/40 dark:text-white/40">→</span>
                        <span>{new Date(recentLeave.toDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                       <p className="text-sm text-black/50 dark:text-white/50">Status:</p>
                       <div>
                          {recentLeave.status === 'APPROVED' ? (
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800/30">
                              🟢 Approved by Hostel Admin
                            </div>
                          ) : recentLeave.status === 'REJECTED' ? (
                            <Badge variant="danger">🔴 Rejected</Badge>
                          ) : (
                            <Badge variant="warning">🟡 Pending Approval</Badge>
                          )}
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center text-black/50 dark:text-white/50 border border-dashed border-border rounded-xl">
                    No recent leave requests found.
                  </div>
                )}
                <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/student/leaves')}>
                   Apply for New Leave
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-lg">
                   <Clock className="w-5 h-5 text-primary-500" /> Current Status
                 </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {recentLeave?.status === 'APPROVED' && new Date(recentLeave.fromDate) <= new Date() && new Date(recentLeave.toDate) >= new Date() ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                      <span className="font-medium text-lg">Currently on Leave</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="font-medium text-lg">Currently in Hostel</span>
                    </>
                  )}
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
