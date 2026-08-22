import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { MessageSquare, Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

const StudentReports = () => {
  const [reports, setReports] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 4;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await api.get('/reports/my');
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reports', { title, description });
      setTitle('');
      setDescription('');
      setShowForm(false);
      setCurrentPage(1);
      fetchReports();
    } catch (error) {
      console.error('Error submitting report:', error);
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

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = reports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(reports.length / reportsPerPage);

  // Auto-adjust page if current page exceeds total pages after deleting items
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Reports</h1>
          <p className="text-black/60 dark:text-white/60">Submit and track your issues or complaints.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'New Report'}
        </Button>
      </div>

      {showForm && (
        <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-900/50">
          <CardHeader>
            <CardTitle>Submit a New Report</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reportTitle" className="text-sm font-medium mb-1 block">Title / Subject</label>
                <Input
                  id="reportTitle"
                  name="reportTitle"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., Room Fan Not Working"
                />
              </div>
              <div>
                <label htmlFor="reportDescription" className="text-sm font-medium mb-1 block">Description</label>
                <textarea
                  id="reportDescription"
                  name="reportDescription"
                  required
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the issue..."
                />
              </div>
              <Button type="submit">Submit Report</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-black/50 dark:text-white/50">
              <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
              <p>You haven't submitted any reports yet.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentReports.map((report) => (
                <Card key={report._id} className="flex flex-col justify-between overflow-hidden">
                  <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base truncate break-words" title={report.title}>
                            {report.title}
                          </h3>
                          <p className="text-xs text-black/60 dark:text-white/60 mt-0.5">
                            Submitted on {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {getStatusBadge(report.status)}
                        </div>
                      </div>

                      <div className="mt-2">
                        <p className="text-xs font-medium text-black/50 dark:text-white/50 mb-1">Description:</p>
                        <p className="text-sm bg-black/5 dark:bg-white/5 p-2.5 rounded-lg max-h-24 overflow-y-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-black/80 dark:text-white/80">
                          {report.description}
                        </p>
                      </div>
                    </div>

                    {report.adminNotes && (
                      <div className="mt-2 border-l-2 border-primary-500 pl-3 py-1 bg-primary-50/50 dark:bg-primary-950/20 rounded-r-md">
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-0.5">Admin Response:</p>
                        <p className="text-sm max-h-20 overflow-y-auto break-words [overflow-wrap:anywhere] text-black/80 dark:text-white/80">{report.adminNotes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 bg-card p-3 rounded-xl border border-border">
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
          </>
        )}
      </div>
    </div>
  );
};

export default StudentReports;
