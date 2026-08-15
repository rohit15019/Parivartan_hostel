import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Building2, Bell, Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ menuItems, userRole, userName, userAvatar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toggleTheme, theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-lg">
            <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="font-bold text-xl tracking-tight">StayEase</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 z-30 shadow-sm dark:shadow-none glass sticky top-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 rounded-md text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="hidden sm:block text-lg font-semibold tracking-tight">
              {userRole === 'admin' ? 'Hostel Administration' : 'Student Portal'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            <button className="relative p-2 rounded-full text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
            </button>

            <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <img src={userAvatar || `https://ui-avatars.com/api/?name=${user?.name || userName}&background=3b82f6&color=fff`} alt={user?.name || userName} className="w-9 h-9 rounded-full border-2 border-border" />
              <div className="hidden sm:flex flex-col">
                <span className="text-sm font-medium leading-tight">{user?.name || userName}</span>
                <span className="text-xs text-black/50 dark:text-white/50">{userRole === 'admin' ? 'Admin' : 'Student'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
