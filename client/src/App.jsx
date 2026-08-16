import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee, History, CalendarDays, BedDouble, Settings, FileText, User as UserIcon } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsList from './pages/admin/StudentsList';
import FeeManagement from './pages/admin/FeeManagement';
import PaymentHistory from './pages/admin/PaymentHistory';
import LeaveRequests from './pages/admin/LeaveRequests';
import RoomsManagement from './pages/admin/RoomsManagement';
import AdminReports from './pages/admin/AdminReports';
import ProfileRequests from './pages/admin/ProfileRequests';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentLeaveRequest from './pages/student/StudentLeaveRequest';
import StudentFees from './pages/student/StudentFees';
import StudentReports from './pages/student/StudentReports';

const adminMenu = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/students', label: 'Students', icon: Users },
  { path: '/admin/fees', label: 'Fees Management', icon: IndianRupee },
  { path: '/admin/history', label: 'Payment History', icon: History },
  { path: '/admin/leaves', label: 'Leave Requests', icon: CalendarDays },
  { path: '/admin/rooms', label: 'Rooms', icon: BedDouble },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
  { path: '/admin/profile-requests', label: 'Change Requests', icon: Settings },
];

const studentMenu = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/profile', label: 'My Profile', icon: UserIcon },
  { path: '/student/fees', label: 'My Fees', icon: IndianRupee },
  { path: '/student/leaves', label: 'Leave Request', icon: CalendarDays },
  { path: '/student/reports', label: 'Reports', icon: FileText },
];

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route element={<DashboardLayout menuItems={adminMenu} userRole="admin" userName="Admin Sir" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentsList />} />
            <Route path="/admin/fees" element={<FeeManagement />} />
            <Route path="/admin/history" element={<PaymentHistory />} />
            <Route path="/admin/leaves" element={<LeaveRequests />} />
            <Route path="/admin/rooms" element={<RoomsManagement />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/profile-requests" element={<ProfileRequests />} />
          </Route>

          {/* Student Routes */}
          <Route element={<DashboardLayout menuItems={studentMenu} userRole="student" userName="Rahul Patel" />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/student/fees" element={<StudentFees />} />
            <Route path="/student/leaves" element={<StudentLeaveRequest />} />
            <Route path="/student/reports" element={<StudentReports />} />
          </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
