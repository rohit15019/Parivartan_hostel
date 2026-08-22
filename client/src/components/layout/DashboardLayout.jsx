import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { Building2, Menu, X, LogOut, Palette, ChevronDown, User, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const AshokaChakra = () => (
  <svg viewBox="0 0 100 100" className="w-6 h-6 text-[#000080] animate-[spin_10s_linear_infinite]">
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4"/>
    <circle cx="50" cy="50" r="8" fill="currentColor"/>
    {[...Array(24)].map((_, i) => (
      <line key={i} x1="50" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="1.5" transform={`rotate(${i * 15} 50 50)`}/>
    ))}
  </svg>
);

const SIDEBAR_COLORS = [
  { name: 'Default', classes: 'bg-card border-border text-foreground', iconClass: 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400', linkClass: 'text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground', activeLinkClass: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' },
  { name: 'Blue', classes: 'bg-blue-600 border-blue-700 text-white', iconClass: 'bg-white/20 text-white', linkClass: 'text-white/70 hover:bg-white/10 hover:text-white', activeLinkClass: 'bg-white/20 text-white font-semibold' },
  { name: 'Indigo', classes: 'bg-indigo-700 border-indigo-800 text-white', iconClass: 'bg-white/20 text-white', linkClass: 'text-white/70 hover:bg-white/10 hover:text-white', activeLinkClass: 'bg-white/20 text-white font-semibold' },
  { name: 'Dark', classes: 'bg-slate-900 border-slate-800 text-white', iconClass: 'bg-white/10 text-white', linkClass: 'text-white/70 hover:bg-white/5 hover:text-white', activeLinkClass: 'bg-primary-600 text-white font-semibold' },
  { name: 'Red', classes: 'bg-red-600 border-red-700 text-white', iconClass: 'bg-white/20 text-white', linkClass: 'text-white/70 hover:bg-white/10 hover:text-white', activeLinkClass: 'bg-white/20 text-white font-semibold' },
  { name: 'Yellow', classes: 'bg-yellow-500 border-yellow-600 text-white', iconClass: 'bg-black/10 text-white', linkClass: 'text-white/80 hover:bg-black/10 hover:text-white', activeLinkClass: 'bg-black/20 text-white font-semibold' },
  { name: 'Green', classes: 'bg-emerald-600 border-emerald-700 text-white', iconClass: 'bg-white/20 text-white', linkClass: 'text-white/70 hover:bg-white/10 hover:text-white', activeLinkClass: 'bg-white/20 text-white font-semibold' },
  { 
    name: 'India', 
    classes: 'bg-gradient-to-b from-[#FF9933] via-white to-[#138808] border-gray-300 text-black', 
    iconClass: 'bg-[#000080]/10 text-[#000080]', 
    linkClass: 'text-black/70 hover:bg-black/10 hover:text-black font-medium', 
    activeLinkClass: 'bg-[#000080]/10 text-[#000080] font-bold shadow-sm backdrop-blur-sm',
    isIndia: true
  }
];

const DashboardLayout = ({ menuItems, userRole, userName, userAvatar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Default to Blue color index = 1
  const [colorIndex, setColorIndex] = useState(1);
  const { toggleTheme, theme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const toggleSidebarColor = () => {
    setColorIndex((prev) => (prev + 1) % SIDEBAR_COLORS.length);
  };

  const currentColor = SIDEBAR_COLORS[colorIndex];
  const role = user?.role || userRole;
  const displayName = user?.name || (user?.email ? user.email.split('@')[0] : (role === 'admin' ? 'Admin Sir' : 'Student'));
  const displayRole = role === 'admin' ? 'Admin' : 'Student';
  const activeAvatar = user?.photo || userAvatar;

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
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[80%] sm:w-[300px] lg:w-[20%] lg:min-w-[250px] lg:max-w-[300px] xl:w-[15%] border-r transform transition-all duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col ${currentColor.classes}`}
      >
        <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10 dark:border-white/10">
          <div className={`p-2 rounded-lg ${currentColor.iconClass}`}>
            {currentColor.isIndia ? <AshokaChakra /> : <Building2 className="w-6 h-6" />}
          </div>
          <span className="font-bold text-xl tracking-tight">Parivartan</span>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? currentColor.activeLinkClass : currentColor.linkClass
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
            <button onClick={toggleSidebarColor} title="Change Sidebar Color" className="p-2 rounded-full text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <Palette className="w-5 h-5" />
            </button>
            <button onClick={toggleTheme} title="Toggle Theme" className="p-2 rounded-full text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <div className="h-8 w-px bg-border mx-2 hidden sm:block"></div>

            {/* Profile Dropdown Trigger & Menu */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center gap-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border transition-all ${
                  profileDropdownOpen 
                    ? 'bg-black/5 dark:bg-white/10 border-primary-500 ring-2 ring-primary-500/20' 
                    : 'border-transparent hover:border-border hover:bg-black/5 dark:hover:bg-white/5'
                }`}
                title="Account & Profile Menu"
              >
                <img 
                  src={activeAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`} 
                  alt={displayName} 
                  className="w-9 h-9 rounded-full border-2 border-border object-cover" 
                />
                <div className="hidden sm:flex flex-col text-left min-w-0 max-w-[130px]">
                  <span className="text-sm font-semibold leading-tight truncate text-foreground">{displayName}</span>
                  <span className="text-xs text-black/50 dark:text-white/50">{displayRole}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-black/50 dark:text-white/50 transition-transform duration-200 hidden sm:block ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Popup */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-card rounded-2xl shadow-xl border border-border overflow-hidden z-50 p-2"
                  >
                    {/* User Info Header */}
                    <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl mb-1 flex items-center gap-3">
                      <img 
                        src={activeAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`} 
                        alt={displayName} 
                        className="w-10 h-10 rounded-full border-2 border-border object-cover shrink-0" 
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold truncate text-foreground leading-tight">{displayName}</p>
                        <p className="text-xs text-black/50 dark:text-white/50 truncate mt-0.5">{user?.email || 'Logged in'}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary-600 dark:text-primary-400 mt-1 uppercase tracking-wide">
                          {userRole === 'admin' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />} {displayRole} Account
                        </span>
                      </div>
                    </div>

                    {/* Quick navigation links */}
                    <div className="py-1 space-y-0.5">
                      {userRole === 'student' ? (
                        <Link
                          to="/student/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-foreground transition-colors"
                        >
                          <User className="w-4 h-4 text-primary-500" />
                          <span>My Profile</span>
                        </Link>
                      ) : (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-foreground transition-colors"
                        >
                          <Shield className="w-4 h-4 text-primary-500" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="my-1 border-t border-border"></div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
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
