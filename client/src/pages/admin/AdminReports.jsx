import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import api from '../../lib/api';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 3;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports');
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/reports/${selectedReport._id}`, { status, adminNotes });
      setReports(reports.map(r => r._id === data._id ? data : r));
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <Badge variant="warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'In Progress': return <Badge variant="info"><AlertCircle className="w-3 h-3 mr-1" /> In Progress</Badge>;
      case 'Resolved': return <Badge variant="success"><CheckCircle className="w-3 h-3 mr-1" /> Resolved</Badge>;
      case 'Rejected': return <Badge variant="danger"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default: return null;
    }
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Reset page to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Student Reports</h1>
          <p className="text-black/60 dark:text-white/60">Manage and resolve issues reported by students.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
          <Input 
            placeholder="Search reports..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <p>Loading reports...</p>
          ) : filteredReports.length === 0 ? (
             <Card>
               <CardContent className="flex flex-col items-center justify-center py-12 text-black/50 dark:text-white/50">
                 <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
                 <p>No reports found.</p>
               </CardContent>
             </Card>
          ) : (
            <>
              {currentReports.map((report) => (
                <Card 
                  key={report._id} 
                  className={`cursor-pointer transition-colors ${selectedReport?._id === report._id ? 'border-primary-500 ring-1 ring-primary-500' : 'hover:border-primary-300'}`}
                  onClick={() => {
                    setSelectedReport(report);
                    setStatus(report.status);
                    setAdminNotes(report.adminNotes || '');
                  }}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-base">{report.title}</h3>
                      {getStatusBadge(report.status)}
                    </div>
                    <div className="text-xs text-black/60 dark:text-white/60 mb-2 flex flex-wrap gap-x-3 gap-y-1">
                      <span>By: {report.studentId?.name} {report.studentId?.surname} ({report.studentId?.studentId})</span>
                      <span>Room: {report.studentId?.roomNumber || 'N/A'}</span>
                      <span>Date: {new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm line-clamp-1 bg-black/5 dark:bg-white/5 p-2 rounded-md">
                      {report.description}
                    </p>
                  </CardContent>
                </Card>
              ))}

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
          {selectedReport ? (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Update Report</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
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
                    <Button type="button" variant="outline" onClick={() => setSelectedReport(null)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-24">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center text-black/50 dark:text-white/50">
                <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
                <p>Select a report from the list<br/>to update its status or add notes.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
