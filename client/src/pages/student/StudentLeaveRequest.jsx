import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Clock, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const StudentLeaveRequest = () => {
  const { user } = useAuth();
  const [pastRequests, setPastRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [leaveType, setLeaveType] = useState('Home Visit');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchLeaveRequests = async () => {
    try {
      const { data } = await api.get('/leaves/my');
      setPastRequests(data);
    } catch (error) {
      console.error('Failed to fetch leave requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchLeaveRequests();
  }, [user]);

  const calculateDays = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e - s);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fromDate || !toDate || !reason) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const days = calculateDays(fromDate, toDate);
      await api.post('/leaves', {
        leaveType,
        fromDate,
        toDate,
        days,
        reason,
        parentPhone
      });
      
      // Reset form
      setFromDate('');
      setToDate('');
      setReason('');
      setParentPhone('');
      
      // Refresh requests
      fetchLeaveRequests();
      alert('Leave request submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    
    try {
      await api.delete(`/leaves/${id}`);
      setPastRequests(pastRequests.filter(req => req._id !== id));
      alert('Leave request deleted successfully.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete leave request');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave Requests</h1>
        <p className="text-black/60 dark:text-white/60">Apply for leave and track your request status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Apply for Leave</CardTitle>
              <CardDescription>Submit a request to the hostel administration.</CardDescription>
            </CardHeader>
            <CardContent>
              {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg">{error}</div>}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="leaveType" className="text-sm font-medium">Leave Type</label>
                  <select 
                    id="leaveType"
                    name="leaveType"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option>Home Visit</option>
                    <option>Emergency</option>
                    <option>Personal Work</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="fromDate" className="text-sm font-medium">From Date *</label>
                    <Input id="fromDate" name="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="toDate" className="text-sm font-medium">To Date *</label>
                    <Input id="toDate" name="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} required min={fromDate} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reason" className="text-sm font-medium">Reason for Leave *</label>
                  <textarea 
                    id="reason"
                    name="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px] resize-y"
                    placeholder="Provide details about your leave..."
                    required
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label htmlFor="parentPhone" className="text-sm font-medium">Parent/Guardian Phone *</label>
                  <Input id="parentPhone" name="parentPhone" type="text" required minLength={10} maxLength={10} pattern="\d{10}" title="Phone number must be exactly 10 digits" placeholder="10 digit number" value={parentPhone} onChange={(e) => setParentPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                </div>

                <Button type="submit" className="w-full gap-2 mt-4" disabled={submitting}>
                  <Send className="w-4 h-4" /> {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Request History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-sm text-black/50">Loading requests...</div>
                ) : pastRequests.length > 0 ? (
                  pastRequests.map((req) => (
                    <div key={req._id} className="p-4 rounded-xl border border-border bg-black/5 dark:bg-white/5 flex flex-col space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 font-medium">
                          <span>{new Date(req.fromDate).toLocaleDateString()}</span>
                          <span className="text-black/40 dark:text-white/40">→</span>
                          <span>{new Date(req.toDate).toLocaleDateString()}</span>
                        </div>
                        {req.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Badge variant="warning">🟡 PENDING</Badge>
                            <button onClick={() => handleDeleteRequest(req._id)} className="text-red-500 hover:text-red-600 transition-colors" title="Delete Request">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        {req.status === 'APPROVED' && <Badge variant="success">🟢 APPROVED</Badge>}
                        {req.status === 'REJECTED' && <Badge variant="danger">🔴 REJECTED</Badge>}
                      </div>
                      
                      <div>
                        <p className="text-sm text-black/60 dark:text-white/60">Reason ({req.leaveType}):</p>
                        <p className="font-medium">{req.reason}</p>
                      </div>

                      <div className="pt-3 border-t border-border flex items-center gap-2 text-sm">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 font-medium">
                            <Clock className="w-4 h-4" /> Waiting for admin approval
                          </div>
                        ) : req.status === 'APPROVED' ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Approved by Admin
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                            <XCircle className="w-4 h-4" /> Rejected by Admin
                          </div>
                        )}
                        <span className="ml-auto text-xs text-black/40 dark:text-white/40">{req.days} Days</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-black/50 border border-dashed border-border rounded-xl p-6">
                    No leave requests found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentLeaveRequest;
