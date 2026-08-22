import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Armchair, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Search, 
  VolumeX, 
  HelpCircle, 
  Calendar, 
  RefreshCw,
  MapPin,
  ChevronDown,
  Building,
  UserCheck
} from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const StudentLibrary = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'occupied', 'my'
  const [sectionFilter, setSectionFilter] = useState('all');
  const [activeFaq, setActiveFaq] = useState(null);

  // Pagination for Seats (16 seats per page)
  const [currentPage, setCurrentPage] = useState(1);
  const seatsPerPage = 16;

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/library/my-seat');
      setData(res.data);
    } catch (error) {
      console.error('Failed to load library seat data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const assignedSeat = data?.assignedSeat;
  const stats = data?.stats || { totalSeats: 0, occupiedSeats: 0, availableSeats: 0 };
  const seats = data?.seats || [];

  // Get unique sections
  const sections = ['all', ...new Set(seats.map(s => s.section).filter(Boolean))];

  // Filtered seats
  const filteredSeats = seats.filter(s => {
    const matchesSearch = s.seatNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = sectionFilter === 'all' || s.section === sectionFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'available') matchesStatus = !s.isOccupied;
    else if (statusFilter === 'occupied') matchesStatus = s.isOccupied;
    else if (statusFilter === 'my') matchesStatus = s.isMySeat;

    return matchesSearch && matchesSection && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredSeats.length / seatsPerPage);
  const indexOfLastSeat = currentPage * seatsPerPage;
  const indexOfFirstSeat = indexOfLastSeat - seatsPerPage;
  const currentSeats = filteredSeats.slice(indexOfFirstSeat, indexOfLastSeat);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Reset to page 1 whenever search or filter options change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sectionFilter]);

  // Adjust current page if it exceeds total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const faqs = [
    {
      q: 'How do I get a library seat assigned to me?',
      a: 'Library seats are allocated by the Hostel Admin / Warden. You can request a seat assignment by visiting the administrative office or raising a request in Change Requests.'
    },
    {
      q: 'Can I swap or change my allocated seat?',
      a: 'Yes, if an empty seat is available, you can submit a seat change request to the hostel administration.'
    },
    {
      q: 'Can I leave my books on the desk overnight?',
      a: 'Yes, if you hold an officially assigned seat, you can keep your study material on your desk. However, keep personal valuables safely in your room.'
    },
    {
      q: 'What should I do if someone else is occupying my assigned seat?',
      a: 'Kindly inform the peer that the seat is reserved. If unresolved, please contact the library coordinator or warden.'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-black/50 dark:text-white/50">Loading library details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-primary-600 dark:text-primary-400" />
            Hostel Study Library
          </h1>
          <p className="text-black/60 dark:text-white/60 text-sm mt-1">
            Check your allocated seat, live hall occupancy, library schedule, and study facilities.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchLibraryData} 
          className="gap-2 shrink-0 border-border"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Hero: Assigned Seat Status Card */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        {assignedSeat ? (
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 text-white relative">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full filter blur-3xl -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-primary-500/20 rounded-full filter blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

            <CardContent className="p-6 sm:p-8 relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Allocated & Active
                  </div>
                  <div>
                    <span className="text-xs uppercase tracking-widest text-primary-200 font-semibold block mb-1">
                      Your Dedicated Study Desk
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-white flex items-center gap-3">
                      <span>Seat {assignedSeat.seatNumber}</span>
                      <Sparkles className="w-6 h-6 text-amber-300" />
                    </h2>
                  </div>
                  <p className="text-sm text-primary-100/80 max-w-xl">
                    This seat is exclusively reserved for you for the current academic session. Please keep your study area neat and orderly.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 shrink-0">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <span className="text-xs text-primary-200 block mb-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" /> Section
                    </span>
                    <span className="text-base font-bold text-white block truncate">
                      {assignedSeat.section || 'Main Hall'}
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                    <span className="text-xs text-primary-200 block mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Floor Level
                    </span>
                    <span className="text-base font-bold text-white block">
                      Floor {assignedSeat.floor || 1}
                    </span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 col-span-2 sm:col-span-1">
                    <span className="text-xs text-primary-200 block mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Allocated On
                    </span>
                    <span className="text-base font-bold text-white block truncate">
                      {assignedSeat.assignedDate ? new Date(assignedSeat.assignedDate).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-dashed border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/20 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">No Library Seat Allocated Yet</h3>
                  <p className="text-sm text-black/60 dark:text-white/60 mt-1 max-w-xl">
                    You currently do not have a reserved library seat. Available seats are assigned on request by the hostel admin or warden.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning">Not Allocated</Badge>
              </div>
            </div>
          </Card>
        )}
      </motion.div>

      {/* Key Overview Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
            <Armchair className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-black/50 dark:text-white/50">Total Library Capacity</p>
            <h4 className="text-xl font-bold text-foreground">{stats.totalSeats} Desks</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-black/50 dark:text-white/50">Available / Vacant Seats</p>
            <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.availableSeats} Available</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-black/50 dark:text-white/50">Occupied Desks</p>
            <h4 className="text-xl font-bold text-foreground">{stats.occupiedSeats} Allocated</h4>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-black/50 dark:text-white/50">Current Operating Status</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold text-foreground">24x7 Open</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Live Seat Map & Availability Visualizer */}
      <Card>
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Armchair className="w-5 h-5 text-primary-500" /> Library Seat Layout & Availability
              </CardTitle>
              <CardDescription className="mt-1">
                Explore the hall layout, see available desks, and locate your assigned seat.
              </CardDescription>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-purple-600 shadow-sm"></span>
                <span className="font-semibold text-purple-700 dark:text-purple-300">My Seat</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 shadow-sm"></span>
                <span className="text-black/70 dark:text-white/70">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-zinc-300 dark:bg-zinc-700"></span>
                <span className="text-black/70 dark:text-white/70">Occupied</span>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-black/40 dark:text-white/40" />
              <Input
                placeholder="Search seat number..."
                className="pl-9 h-9 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {/* Status Filter */}
              <div className="inline-flex rounded-lg p-1 bg-black/5 dark:bg-white/5 text-xs font-medium">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 rounded-md transition-colors ${statusFilter === 'all' ? 'bg-card shadow-sm text-foreground' : 'text-black/60 dark:text-white/60'}`}
                >
                  All ({seats.length})
                </button>
                <button
                  onClick={() => setStatusFilter('available')}
                  className={`px-3 py-1 rounded-md transition-colors ${statusFilter === 'available' ? 'bg-card shadow-sm text-foreground' : 'text-black/60 dark:text-white/60'}`}
                >
                  Available ({stats.availableSeats})
                </button>
                <button
                  onClick={() => setStatusFilter('occupied')}
                  className={`px-3 py-1 rounded-md transition-colors ${statusFilter === 'occupied' ? 'bg-card shadow-sm text-foreground' : 'text-black/60 dark:text-white/60'}`}
                >
                  Occupied ({stats.occupiedSeats})
                </button>
                {assignedSeat && (
                  <button
                    onClick={() => setStatusFilter('my')}
                    className={`px-3 py-1 rounded-md transition-colors ${statusFilter === 'my' ? 'bg-purple-600 text-white shadow-sm font-semibold' : 'text-purple-600 dark:text-purple-400'}`}
                  >
                    My Seat
                  </button>
                )}
              </div>

              {/* Section Filter */}
              {sections.length > 2 && (
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="h-9 px-3 text-xs rounded-lg border border-border bg-background"
                >
                  {sections.map(sec => (
                    <option key={sec} value={sec}>
                      {sec === 'all' ? 'All Sections' : sec}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {filteredSeats.length === 0 ? (
            <div className="py-12 text-center text-black/50 dark:text-white/50 text-sm">
              No library seats found matching the filter criteria.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {currentSeats.map((seat) => {
                  const isMy = seat.isMySeat;
                  const isOcc = seat.isOccupied;

                  return (
                    <motion.div
                      key={seat._id}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.15 }}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                        isMy 
                          ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-400 ring-offset-2 dark:ring-offset-slate-900' 
                          : isOcc
                            ? 'bg-black/5 dark:bg-white/5 border-border text-black/40 dark:text-white/40'
                            : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200'
                      }`}
                    >
                      <Armchair className={`w-5 h-5 mb-1 ${isMy ? 'text-white animate-bounce' : isOcc ? 'text-black/30 dark:text-white/30' : 'text-emerald-600 dark:text-emerald-400'}`} />
                      <span className={`text-sm font-bold tracking-tight ${isMy ? 'text-white' : ''}`}>
                        {seat.seatNumber}
                      </span>
                      <span className="text-[10px] opacity-75 truncate max-w-full">
                        {isMy ? 'Your Desk' : isOcc ? 'Occupied' : 'Vacant'}
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-6 pt-4 border-t border-border">
                  <span className="text-xs text-black/60 dark:text-white/60 order-2 sm:order-1">
                    Showing {indexOfFirstSeat + 1}–{Math.min(indexOfLastSeat, filteredSeats.length)} of {filteredSeats.length} seats
                  </span>
                  <div className="flex items-center gap-2 order-1 sm:order-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1}
                      className="h-8 text-xs px-3"
                    >
                      Previous
                    </Button>
                    <span className="text-xs font-semibold px-2 text-foreground">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleNextPage} 
                      disabled={currentPage === totalPages}
                      className="h-8 text-xs px-3"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Two Column Section: Code of Conduct + FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules & Guidelines */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <VolumeX className="w-4 h-4 text-red-500" /> Library Code of Conduct
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5 text-xs text-black/70 dark:text-white/70 flex-1">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-100 dark:border-red-900/30">
              <VolumeX className="w-4 h-4 shrink-0 mt-0.5" />
              <span><strong>Strict Silence:</strong> Phone calls or group discussions inside the reading hall are strictly prohibited.</span>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Keep Devices on Silent:</strong> All mobile phones and laptops must remain on silent or vibrate mode.</span>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Desk Courtesy:</strong> Please keep your study desk clean. Do not leave food items or tea cups on desks.</span>
            </div>
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-black/5 dark:bg-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>24 x 7 CCTV Coverage:</strong> Round the clock surveillance for safety and discipline.</span>
            </div>
          </CardContent>
        </Card>

        {/* FAQs Accordion */}
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary-500" /> Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 flex-1">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-border/60 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-3 text-xs font-semibold flex items-center justify-between gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-black/40 dark:text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-3 pb-3 text-xs text-black/60 dark:text-white/60 border-t border-border/40 pt-2 bg-black/[0.02] dark:bg-white/[0.02]"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentLibrary;
