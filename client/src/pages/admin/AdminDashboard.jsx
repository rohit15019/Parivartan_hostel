import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, IndianRupee, Clock, CalendarDays, TrendingUp, UserMinus, FileText } from 'lucide-react';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, subtitle, trend, colorClass, onClick }) => (
  <Card 
    className={`hover:-translate-y-1 transition-transform duration-300 h-full ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-5 h-full flex flex-col justify-center">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-black/60 dark:text-white/60 mb-1 truncate">{title}</p>
          <h3 className="text-2xl xl:text-3xl font-bold tracking-tight mb-2 truncate">{value}</h3>
          {subtitle && (
             <p className="text-xs font-medium text-black/50 dark:text-white/50 mt-1 truncate">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-xs font-medium text-green-500 truncate">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-2xl shrink-0 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [yearlyGraphData, setYearlyGraphData] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const { data } = await api.get('/dashboard/admin');
        setStatsData(data.stats);
        
        // Format recent payments for the UI
        const formattedPayments = (data.recentPayments || []).map((payment, idx) => ({
          id: payment._id || idx,
          name: payment.studentId?.name || 'Unknown',
          room: payment.studentId?.roomNumber || 'N/A',
          amount: `₹${payment.amount.toLocaleString()}`,
          date: new Date(payment.paymentDate).toLocaleDateString(),
          status: payment.paymentMethod
        }));
        setRecentPayments(formattedPayments);
        
        const graphData = data.yearlyGraphData || {};
        setYearlyGraphData(graphData);
        
        // Select the most recent year by default
        const years = Object.keys(graphData).sort((a, b) => b - a);
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } catch (error) {
        console.error('Failed to fetch admin dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const currentYear = new Date().getFullYear().toString();
  const activeYear = selectedYear || statsData?.currentYear?.toString() || currentYear;
  const displayedFees = (statsData?.yearlyTotals && statsData.yearlyTotals[activeYear] !== undefined)
    ? statsData.yearlyTotals[activeYear]
    : (statsData?.currentYearFeesCollected ?? statsData?.totalFeesCollected ?? 0);

  const stats = [
    { title: "Total Students", value: statsData?.totalStudents || 0, icon: Users, colorClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400", path: "/admin/students" },
    { 
      title: "Fees Collected", 
      value: `₹${displayedFees.toLocaleString()}`, 
      icon: IndianRupee, 
      subtitle: `Year ${activeYear} Received`, 
      colorClass: "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400", 
      path: "/admin/history" 
    },
    { title: "Pending Reports", value: statsData?.pendingReports || 0, icon: FileText, subtitle: "Unresolved", colorClass: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400", path: "/admin/reports" },
    { title: "Leave Requests", value: statsData?.pendingLeaves || 0, icon: CalendarDays, subtitle: "Pending Approval", colorClass: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400", path: "/admin/leaves" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello Sir 👋</h1>
          <p className="text-black/60 dark:text-white/60">Here's what's happening in your hostel today.</p>
        </div>
        <div className="flex gap-2">
           {/* Add Date Picker or quick action buttons here later */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-4 text-center text-black/50 dark:text-white/50">Loading stats...</div>
        ) : stats.map((stat, i) => (
          <div key={i} className="animate-slide-up h-full" style={{ animationDelay: `${i * 100}ms` }}>
            <StatCard {...stat} onClick={stat.path ? () => navigate(stat.path) : undefined} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row justify-between items-center pb-2">
              <CardTitle>Fee Collection Overview</CardTitle>
              {Object.keys(yearlyGraphData).length > 0 && (
                <select 
                  id="selectedYear"
                  name="selectedYear"
                  aria-label="Select Year"
                  className="bg-black/5 dark:bg-white/5 border-none text-sm font-medium rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {Object.keys(yearlyGraphData).sort((a, b) => b - a).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col pb-6">
              <div className="flex-1 w-full mt-4 h-64 min-h-[250px]">
                {yearlyGraphData[selectedYear] ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={yearlyGraphData[selectedYear]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-black/10 dark:text-white/10" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }}
                        tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#0ea5e9" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-black/50 dark:text-white/50">
                    No data available for this year
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: '600ms' }}>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Payments</CardTitle>
                <button className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg text-primary-600 dark:text-primary-400">
                  <FileText className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-6">
                {loading ? (
                  <p className="text-center text-sm text-black/50 dark:text-white/50 py-4">Loading recent payments...</p>
                ) : recentPayments.length === 0 ? (
                  <p className="text-center text-sm text-black/50 dark:text-white/50 py-4">No recent payments found.</p>
                ) : recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
                        {payment.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium leading-none">{payment.name}</p>
                        <p className="text-sm text-black/50 dark:text-white/50 mt-1">Room {payment.room} • {payment.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600 dark:text-green-400">{payment.amount}</p>
                      <p className="text-xs font-medium text-black/50 dark:text-white/50 mt-1">{payment.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
