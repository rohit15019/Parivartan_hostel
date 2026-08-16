import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MessageSquare, Clock, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import api from '../../lib/api';

const ProfileRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 4;

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/profile-requests');
      setRequests(data);
    } catch (error) {
      console.error('Error fetching profile requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/profile-requests/${selectedRequest._id}`, { status, adminNotes });
      setRequests(requests.map(r => r._id === data._id ? data : r));
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this profile change request?')) {
      try {
        await api.delete(`/profile-requests/${id}`);
        setRequests(requests.filter(r => r._id !== id));
        if (selectedRequest?._id === id) {
          setSelectedRequest(null);
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Failed to delete request');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'Approved': return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'Rejected': return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default: return null;
    }
  };

  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(requests.length / requestsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Data Change Requests</h1>
        <p className="text-black/60 dark:text-white/60">Review and manage student profile change requests.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length === 0 ? (
             <Card>
               <CardContent className="flex flex-col items-center justify-center py-12 text-black/50 dark:text-white/50">
                 <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                 <p>No change requests found.</p>
               </CardContent>
             </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentRequests.map((req) => (
                  <Card 
                    key={req._id} 
                    className={`cursor-pointer transition-colors aspect-square flex flex-col justify-between ${selectedRequest?._id === req._id ? 'border-primary-500 ring-1 ring-primary-500' : 'hover:border-primary-300'}`}
                    onClick={() => {
                      setSelectedRequest(req);
                      setStatus(req.status);
                      setAdminNotes(req.adminNotes || '');
                    }}
                  >
                    <CardContent className="p-3 sm:p-4 flex-1 flex flex-col relative">
                      <div className="flex justify-between items-start mb-1 pr-6">
                        <h3 className="font-semibold text-base line-clamp-1">Profile Change Request</h3>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(req.status)}
                          <button
                            onClick={(e) => handleDelete(req._id, e)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete Request"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-black/60 dark:text-white/60 mb-2 flex flex-col gap-y-1">
                        <span>By: {req.studentId?.name} {req.studentId?.surname} ({req.studentId?.studentId})</span>
                        <span>Date: {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex-1 overflow-hidden mt-auto">
                        <p className="text-sm line-clamp-3 bg-black/5 dark:bg-white/5 p-2 rounded-md h-full">
                          {req.requestText}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 bg-card p-3 rounded-xl border border-border">
                  <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  <span className="text-sm">Page {currentPage} of {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedRequest ? (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Request Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-1">Change Request</h3>
                  <div className="text-sm text-black/60 dark:text-white/60 flex flex-col gap-y-1 mb-2">
                    <span>{selectedRequest.studentId?.name} {selectedRequest.studentId?.surname}</span>
                    <span>ID: {selectedRequest.studentId?.studentId}</span>
                  </div>
                  <p className="text-sm bg-black/5 dark:bg-white/5 p-3 rounded-lg whitespace-pre-wrap max-h-40 overflow-y-auto border border-border">
                    {selectedRequest.requestText}
                  </p>
                </div>
                <form onSubmit={handleUpdate} className="space-y-4 border-t pt-4 border-border">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Update Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Admin Notes</label>
                    <textarea
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[120px]"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add a response or internal note..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Save Update</Button>
                    <Button type="button" variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-24">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-black/50 dark:text-white/50">
                <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                <p>Select a request from the list<br/>to review details and update status.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileRequests;
