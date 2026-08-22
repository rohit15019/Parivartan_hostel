import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, IndianRupee, History, CalendarDays, BedDouble, Settings, FileText, User as UserIcon, BookOpen } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentsList from './pages/admin/StudentsList';
import FeeManagement from './pages/admin/FeeManagement';
import PaymentHistory from './pages/admin/PaymentHistory';
import LeaveRequests from './pages/admin/LeaveRequests';
import RoomsManagement from './pages/admin/RoomsManagement';
import LibraryManagement from './pages/admin/LibraryManagement';
import AdminReports from './pages/admin/AdminReports';
import ProfileRequests from './pages/admin/ProfileRequests';

// Public Pages
import AboutUs from './pages/public/AboutUs';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentLibrary from './pages/student/StudentLibrary';
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
  { path: '/admin/library', label: 'Library', icon: BookOpen },
  { path: '/admin/reports', label: 'Reports', icon: FileText },
  { path: '/admin/profile-requests', label: 'Change Requests', icon: Settings },
];

const studentMenu = [
  { path: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/student/profile', label: 'My Profile', icon: UserIcon },
  { path: '/student/library', label: 'Library', icon: BookOpen },
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
            <Route path="/about" element={<AboutUs />} />
            
            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRole="admin" />}>
              <Route element={<DashboardLayout menuItems={adminMenu} userRole="admin" />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/students" element={<StudentsList />} />
                <Route path="/admin/fees" element={<FeeManagement />} />
                <Route path="/admin/history" element={<PaymentHistory />} />
                <Route path="/admin/leaves" element={<LeaveRequests />} />
                <Route path="/admin/rooms" element={<RoomsManagement />} />
                <Route path="/admin/library" element={<LibraryManagement />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/admin/profile-requests" element={<ProfileRequests />} />
              </Route>
            </Route>

            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute allowedRole="student" />}>
              <Route element={<DashboardLayout menuItems={studentMenu} userRole="student" />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/profile" element={<StudentProfile />} />
                <Route path="/student/library" element={<StudentLibrary />} />
                <Route path="/student/fees" element={<StudentFees />} />
                <Route path="/student/leaves" element={<StudentLeaveRequest />} />
                <Route path="/student/reports" element={<StudentReports />} />
              </Route>
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
