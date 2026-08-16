import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Check, X, Clock, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const LeaveRequests = () => {
  const [filter, setFilter] = useState('PENDING');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const { data } = await api.get('/leaves');
        
        // Map backend data to UI expected format
        const formattedData = data.map(req => ({
          id: req._id,
          name: req.studentId?.name || 'Unknown Student',
          room: req.studentId?.roomNumber || 'N/A',
          from: new Date(req.fromDate).toLocaleDateString(),
          to: new Date(req.toDate).toLocaleDateString(),
          days: req.days,
          reason: req.reason,
          status: req.status
        }));
        
        setRequests(formattedData);
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.put(`/leaves/${id}/status`, { status: newStatus });
      setRequests(requests.map(req => req.id === id ? { ...req, status: newStatus } : req));
    } catch (error) {
      alert(error.response?.data?.message || `Failed to update status to ${newStatus}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await api.delete(`/leaves/${id}`);
        setRequests(requests.filter(req => req.id !== id));
      } catch (error) {
        console.error('Failed to delete leave request:', error);
        alert(error.response?.data?.message || 'Failed to delete leave request');
      }
    }
  };

  const filteredRequests = requests.filter(req => req.status === filter);

  return (
    <div className="space-y-6">

      <div className="flex space-x-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg w-full max-w-md">
        {['PENDING', 'APPROVED', 'DENIED'].map((f) => (
          <button
            key={f}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${filter === f ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center flex flex-col items-center justify-center">
             <p className="text-lg font-medium text-black/50 dark:text-white/50">Loading leave requests...</p>
          </div>
        ) : filteredRequests.map((request, idx) => (
          <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
                      {request.name.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{request.name}</CardTitle>
                      <p className="text-sm text-black/50 dark:text-white/50">Room {request.room}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'PENDING' && <Badge variant="warning">🟡 PENDING</Badge>}
                    {request.status === 'APPROVED' && <Badge variant="success">🟢 APPROVED</Badge>}
                    {request.status === 'DENIED' && <Badge variant="danger">🔴 DENIED</Badge>}
                    <button
                      onClick={() => handleDelete(request.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-medium">
                    <CalendarDays className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    <span>{request.from}</span>
                    <span className="text-black/40 dark:text-white/40">→</span>
                    <span>{request.to}</span>
                    <span className="ml-auto text-primary-600 dark:text-primary-400 font-bold">{request.days} Days</span>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-black/50 dark:text-white/50 mb-1">Reason:</p>
                    <p className="text-sm p-3 border border-border rounded-lg bg-card text-black/80 dark:text-white/80">
                      "{request.reason}"
                    </p>
                  </div>
                </div>
              </CardContent>
              {request.status === 'PENDING' && (
                <CardFooter className="flex gap-3 border-t border-border pt-4">
                  <Button onClick={() => handleStatusUpdate(request.id, 'APPROVED')} className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Check className="w-4 h-4" /> Approve
                  </Button>
                  <Button onClick={() => handleStatusUpdate(request.id, 'DENIED')} variant="danger" className="flex-1 gap-2">
                    <X className="w-4 h-4" /> Deny
                  </Button>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        ))}
        {!loading && filteredRequests.length === 0 && (
          <div className="col-span-full py-12 text-center flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl">
             <Clock className="w-12 h-12 text-black/20 dark:text-white/20 mb-3" />
             <p className="text-lg font-medium text-black/50 dark:text-white/50">No {filter.toLowerCase()} requests found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveRequests;
