import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, History, CreditCard, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const StudentFees = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const { data: profileData } = await api.get('/students/profile');
        setProfile(profileData);
        
        if (profileData && profileData._id) {
          const { data: feeData } = await api.get(`/fees/${profileData._id}`);
          setFee(feeData);
        }
      } catch (error) {
        console.error('Failed to fetch fee data', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchFees();
  }, [user]);

  if (loading) return <div className="p-8 text-center">Loading fee details...</div>;
  if (!profile || !fee) return <div className="p-8 text-center">No fee records found.</div>;

  const totalFees = fee.totalFees || 0;
  const paidAmount = fee.paidAmount || 0;
  const remaining = totalFees - paidAmount;
  const progressPercent = totalFees > 0 ? Math.round((paidAmount / totalFees) * 100) : 0;
  
  let feeStatus = 'PENDING';
  if (totalFees > 0) {
    feeStatus = paidAmount >= totalFees ? 'FULLY PAID' : paidAmount > 0 ? 'PARTIALLY PAID' : 'PENDING';
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FULLY PAID': return <Badge variant="success">🟢 FULLY PAID</Badge>;
      case 'HALF PAID': return <Badge variant="warning">🟡 HALF PAID</Badge>;
      case 'PARTIALLY PAID': return <Badge variant="warning">🟡 PARTIALLY PAID</Badge>;
      case 'PENDING': return <Badge variant="danger">🔴 PENDING</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Fees History</h1>
          <p className="text-black/60 dark:text-white/60">View your fee details and payment history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Student Overview */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 text-2xl font-bold">
                      {(profile.name || 'U').charAt(0)}
                   </div>
                   <div>
                     <CardTitle className="text-xl">{profile.name}</CardTitle>
                     <CardDescription className="mt-1">{profile.studentId} • Room {profile.roomNumber} • {profile.course}</CardDescription>
                   </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-black/50 dark:text-white/50 font-medium mb-1">Total Fees</p>
                    <p className="text-2xl font-bold">₹{totalFees.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-black/50 dark:text-white/50 font-medium mb-1">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{paidAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-black/50 dark:text-white/50 font-medium mb-1">Remaining</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{remaining.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-black/70 dark:text-white/70">Payment Progress</span>
                    <span className="font-bold">{progressPercent}%</span>
                  </div>
                  <ProgressBar value={paidAmount} max={totalFees || 1} className="h-3" />
                  <div className="mt-2 text-right">
                    {getStatusBadge(feeStatus)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Column: Payment History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary-500" /> Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-primary-100 dark:border-primary-900/50 ml-3 space-y-8 pb-4">
                {fee.paymentHistory && fee.paymentHistory.length > 0 ? (
                  fee.paymentHistory.map((payment, idx) => (
                    <div key={payment._id || idx} className="relative pl-6">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary-500 ring-4 ring-card"></span>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-black/50 dark:text-white/50">{new Date(payment.date).toLocaleDateString()}</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">₹{payment.amount.toLocaleString()}</span>
                        <div className="flex items-center gap-3 text-sm text-black/60 dark:text-white/60 mt-1">
                          <span className="flex items-center gap-1"><CreditCard className="w-4 h-4"/> {payment.method}</span>
                          {payment.referenceNumber && <span className="flex items-center gap-1"><FileText className="w-4 h-4"/> {payment.referenceNumber}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-black/50 dark:text-white/50 pl-4">No payments recorded yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentFees;
