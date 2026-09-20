import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Check, X, Clock, Trash2, Phone } from 'lucide-react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const LeaveRequests = () => {
  const [filter, setFilter] = useState('PENDING');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state (6 requests per page)
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 6;

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const { data } = await api.get('/leaves');
        
        // Map backend data to UI expected format (only show requests where student specified dates)
        const formattedData = data
          .filter(req => req.fromDate && req.toDate && !isNaN(new Date(req.fromDate).getTime()) && !isNaN(new Date(req.toDate).getTime()))
          .map(req => ({
            id: req._id,
            name: req.studentId ? `${req.studentId.name}${req.studentId.surname ? ' ' + req.studentId.surname : ''}` : 'Unknown Student',
            photo: req.studentId?.photo || '',
            room: req.studentId?.roomNumber || 'N/A',
            leaveType: req.leaveType || 'Leave',
            parentPhone: req.parentPhone || '',
            studentPhone: req.studentId?.phone || '',
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

  // Reset to page 1 whenever the filter tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const filteredRequests = requests.filter(req => req.status === filter);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  // Clamp current page if total pages decrease
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getTabCount = (statusKey) => requests.filter(r => r.status === statusKey).length;

  return (
    <div className="space-y-6">

      <div className="flex space-x-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg w-full max-w-md">
        {['PENDING', 'APPROVED', 'DENIED'].map((f) => (
          <button
            key={f}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${filter === f ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0) + f.slice(1).toLowerCase()} ({getTabCount(f)})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center flex flex-col items-center justify-center">
             <p className="text-lg font-medium text-black/50 dark:text-white/50">Loading leave requests...</p>
          </div>
        ) : currentRequests.map((request, idx) => (
          <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {request.photo ? (
                      <img 
                        src={request.photo} 
                        alt={request.name} 
                        className="w-10 h-10 rounded-full object-cover border border-border shrink-0 shadow-xs" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold shrink-0">
                        {request.name.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate block" title={request.name}>{request.name}</CardTitle>
                      <p className="text-sm text-black/50 dark:text-white/50 truncate">Room {request.room}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
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
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2.5 bg-black/5 dark:bg-white/5 rounded-lg text-sm font-medium">
                    <CalendarDays className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" />
                    <span className="text-xs sm:text-sm">{request.from}</span>
                    <span className="text-black/40 dark:text-white/40">→</span>
                    <span className="text-xs sm:text-sm">{request.to}</span>
                    <span className="ml-auto text-xs sm:text-sm text-primary-600 dark:text-primary-400 font-bold shrink-0">{request.days} Days</span>
                  </div>

                  {/* Leave Type & Contact Number Badge */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {request.leaveType && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                          {request.leaveType}
                        </span>
                      )}
                    </div>

                    {/* Student Added Number / Contact Number */}
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {request.parentPhone && (
                        <a 
                          href={`tel:${request.parentPhone}`}
                          className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors group"
                          title="Call Added Contact Number"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">Added Contact:</span>
                            <span className="font-bold font-mono tracking-wide text-xs">{request.parentPhone}</span>
                          </div>
                        </a>
                      )}
                      {request.studentPhone && request.studentPhone !== request.parentPhone && (
                        <a 
                          href={`tel:${request.studentPhone}`}
                          className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group"
                          title="Call Student Mobile Number"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                          <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">Student Mobile:</span>
                            <span className="font-bold font-mono tracking-wide text-xs">{request.studentPhone}</span>
                          </div>
                        </a>
                      )}
                      {!request.parentPhone && !request.studentPhone && (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-black/5 dark:bg-white/5 text-black/50 dark:text-white/50 text-xs">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>No contact number provided</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-black/50 dark:text-white/50 mb-1">Reason:</p>
                    <p className="text-sm p-2.5 border border-border rounded-lg bg-card text-black/80 dark:text-white/80 whitespace-pre-wrap break-words [overflow-wrap:anywhere] max-h-28 overflow-y-auto leading-relaxed">
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

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border border-border mt-6">
          <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="text-sm text-black/60 dark:text-white/60 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
