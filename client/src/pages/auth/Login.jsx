import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  Target, 
  Compass, 
  Users, 
  Award, 
  MapPin, 
  Phone, 
  UserCheck, 
  Sparkles, 
  Quote, 
  BookOpen, 
  ExternalLink, 
  Camera, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  KeyRound,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

import logoImg from '../../assets/original.jpeg';
import eventTrainingImg from '../../assets/event_training.jpg';
import hostelCampusImg from '../../assets/hostel_campus.jpg';
import hostelBuildingImg from '../../assets/hostel_building.jpg';

// Reusable About Us Content Component for both Desktop Sidebar & Mobile View
const AboutUsContent = ({ onNavigateToAbout }) => (
  <div className="space-y-6">
    {/* Header / Brand */}
    <div>
      <div className="flex items-center justify-between gap-3 mb-4">
        <button 
          type="button"
          onClick={onNavigateToAbout}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-primary-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer group shadow-sm hover:scale-105"
          title="Click to open full About Us page"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary-300 group-hover:rotate-12 transition-transform" />
          <span>About Us</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          type="button"
          onClick={onNavigateToAbout}
          className="text-xs font-semibold text-primary-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer hover:underline"
        >
          <span>Full Page View</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
      
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg shrink-0 flex items-center justify-center border border-white/20">
          <img src={logoImg} alt="Parivartan Logo" className="w-full h-full object-contain rounded-xl" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-extrabold tracking-tight text-white">
            Parivartan Hostel
          </h1>
          <p className="text-xs text-primary-200 font-medium mt-0.5">Surendranagar, Gujarat • Est. 2012</p>
        </div>
      </div>
    </div>

    {/* Core Vision Quote */}
    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 relative">
      <Quote className="w-6 h-6 text-primary-300/60 mb-1" />
      <p className="text-base italic text-primary-100 font-medium leading-relaxed">
        “Social transformation is impossible without education.”
      </p>
      <p className="text-xs text-primary-200/80 mt-2 font-light">
        With this vision at our core, we are committed to creating an environment where students can focus on learning, personal growth, discipline, and building a better future.
      </p>
    </div>

    {/* History & Guiding Principle */}
    <div className="space-y-3 text-sm text-primary-100/90 leading-relaxed">
      <p>
        <span className="font-semibold text-white">Established in 2012</span>, Parivartan Hostel has been serving students by providing a supportive and inspiring space for their educational journey. Our mission is to make learning accessible and meaningful for everyone, following our guiding principle:
      </p>
      
      <div className="p-3 bg-gradient-to-r from-primary-600/40 to-indigo-600/40 border border-primary-400/30 rounded-xl text-center">
        <span className="text-xs sm:text-sm font-bold tracking-wide text-white flex items-center justify-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-300" />
          Learn Anytime, Anywhere.
        </span>
      </div>

      <p>
        Over the years, we have grown into a community that values education as a powerful tool for positive social change. We aim to encourage students to develop knowledge, confidence, skills, and a strong sense of responsibility toward society.
      </p>
    </div>

    {/* Vision & Mission Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
        <div className="flex items-center gap-2 text-primary-300 font-bold text-sm">
          <Target className="w-4 h-4 text-primary-400" />
          Our Vision
        </div>
        <p className="text-xs text-primary-100/80 leading-relaxed">
          To empower students through education and contribute to meaningful social transformation.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm space-y-2">
        <div className="flex items-center gap-2 text-primary-300 font-bold text-sm">
          <Compass className="w-4 h-4 text-primary-400" />
          Our Mission
        </div>
        <p className="text-xs text-primary-100/80 leading-relaxed">
          To provide a supportive learning environment where students grow academically & personally with strong societal values.
        </p>
      </div>
    </div>

    {/* Our Impact Stats */}
    <div className="space-y-2.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-primary-300 flex items-center gap-1.5">
        <Award className="w-3.5 h-3.5" /> Our Impact
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary-500/20 text-primary-300">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl xl:text-2xl font-extrabold text-white">11,000+</div>
            <div className="text-[11px] text-primary-200 font-medium">Students Enrolled</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl xl:text-2xl font-extrabold text-white">50+</div>
            <div className="text-[11px] text-primary-200 font-medium">Certified Trainers</div>
          </div>
        </div>
      </div>
    </div>

    {/* Campus Photos Preview */}
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary-300 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" /> Campus Gallery
        </h3>
        <button
          type="button"
          onClick={onNavigateToAbout}
          className="text-[11px] text-primary-300 hover:text-white flex items-center gap-1 transition-colors hover:underline cursor-pointer"
        >
          View All Photos <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div 
        onClick={onNavigateToAbout}
        className="grid grid-cols-3 gap-2 p-2 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md cursor-pointer group hover:bg-white/15 transition-all"
        title="Click to view full photo gallery on About Us page"
      >
        <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40">
          <img 
            src={eventTrainingImg} 
            alt="Student Training Event" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40">
          <img 
            src={hostelCampusImg} 
            alt="Hostel Campus Greenery" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40">
          <img 
            src={hostelBuildingImg} 
            alt="Hostel Building Grounds" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
      </div>
    </div>

    {/* Contact Information */}
    <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-primary-300 flex items-center gap-1.5">
        <Phone className="w-3.5 h-3.5" /> Contact Information
      </h3>
      
      <div className="space-y-2 text-xs text-primary-100/90">
        <div className="flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-primary-300 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Address: </span>
            80 Foot Road, Near Desal Bhagat Ni Vav, Patel Boarding, Surendranagar – 363001, Gujarat, India
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <a 
            href="tel:+919979999228" 
            className="flex items-center gap-2 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            <Phone className="w-3.5 h-3.5 text-primary-300 shrink-0" />
            <span>+91 99799 99228</span>
          </a>

          <a 
            href="mailto:vallabhdharejiya9@gmail.com" 
            className="flex items-center gap-2 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5 truncate"
          >
            <Mail className="w-3.5 h-3.5 text-primary-300 shrink-0" />
            <span className="truncate">vallabhdharejiya9@gmail.com</span>
          </a>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-primary-200">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Administrator:</span>
            <strong className="text-white">Vallabhbhai Dharajiya</strong>
          </span>
          <span className="text-primary-300/80 font-mono">Est. 2012</span>
        </div>
      </div>
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const [mobileTab, setMobileTab] = useState('login'); // 'login' | 'about'
  
  // Navigation Steps: 'credentials' | 'first_login_otp' | 'forgot_request' | 'forgot_verify'
  const [step, setStep] = useState('credentials');
  
  // OTP States
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [tempToken, setTempToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const otpInputRefs = useRef([]);
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const { 
    login, 
    verifyOtp, 
    resendOtp, 
    requestForgotPassword, 
    resetPassword, 
    resendResetOtp, 
    user, 
    token 
  } = useAuth();

  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [token, user, navigate]);

  // Resend Timer Countdown
  useEffect(() => {
    let interval = null;
    if ((step === 'first_login_otp' || step === 'forgot_verify') && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Step 1: Handle Credentials Submit (Signs in directly or asks for first-time OTP)
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const response = await login(email, password, role);

      if (response && response.requiresOtp) {
        // First-time login requires email verification OTP
        setTempToken(response.tempToken);
        setMaskedEmail(response.maskedEmail || email);
        setStep('first_login_otp');
        setOtp(['', '', '', '', '', '']);
        setResendTimer(60);
        setCanResend(false);
        setSuccessMessage(response.message || 'Verification code sent for first-time activation.');

        setTimeout(() => {
          if (otpInputRefs.current[0]) {
            otpInputRefs.current[0].focus();
          }
        }, 150);
      } else if (response && (response.token || token)) {
        // Already verified: direct sign-in completed!
        if (response.role === 'admin' || role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/student/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : (err.message || 'Login failed. Please check your credentials.'));
    } finally {
      setLoading(false);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    if (!cleanVal && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanVal ? cleanVal[cleanVal.length - 1] : '';
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pastedData) {
      const newOtp = ['', '', '', '', '', ''];
      for (let i = 0; i < 6 && i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pastedData.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // Verify First-Time Login OTP
  const handleVerifyFirstLoginOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const loggedUser = await verifyOtp(tempToken, enteredOtp);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : (err.message || 'Verification failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Resend Login OTP
  const handleResendLoginOtp = async () => {
    if (!canResend || resendLoading) return;

    setError('');
    setSuccessMessage('');
    setResendLoading(true);

    try {
      const res = await resendOtp(tempToken);
      setSuccessMessage(res.message || 'A fresh verification code has been sent.');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setError(typeof err === 'string' ? err : (err.message || 'Failed to resend code.'));
    } finally {
      setResendLoading(false);
    }
  };

  // Forgot Password: Request OTP
  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await requestForgotPassword(forgotEmail || email, role);
      setTempToken(res.tempToken);
      setMaskedEmail(res.maskedEmail || forgotEmail || email);
      setStep('forgot_verify');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setResendTimer(60);
      setCanResend(false);
      setSuccessMessage(res.message || 'Password reset code sent to your email.');

      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 150);
    } catch (err) {
      setError(typeof err === 'string' ? err : (err.message || 'Failed to send reset code.'));
    } finally {
      setLoading(false);
    }
  };

  // Reset Password: Submit New Password & OTP
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await resetPassword(tempToken, enteredOtp, newPassword);
      setSuccessMessage(res.message || 'Password reset successfully! Please sign in with your new password.');
      setPassword(newPassword);
      setEmail(forgotEmail || email);
      setStep('credentials');
    } catch (err) {
      setError(typeof err === 'string' ? err : (err.message || 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  // Resend Password Reset OTP
  const handleResendResetOtp = async () => {
    if (!canResend || resendLoading) return;

    setError('');
    setSuccessMessage('');
    setResendLoading(true);

    try {
      const res = await resendResetOtp(tempToken);
      setSuccessMessage(res.message || 'A fresh reset code has been sent.');
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setError(typeof err === 'string' ? err : (err.message || 'Failed to resend reset code.'));
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setStep('credentials');
    setError('');
    setSuccessMessage('');
    setOtp(['', '', '', '', '', '']);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-background">
      {/* Top Mobile Bar (visible on < lg) */}
      <div className="lg:hidden w-full sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 shadow-xs">
        <div 
          className="flex items-center gap-2 cursor-pointer shrink-0" 
          onClick={() => {
            setMobileTab('login');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white p-0.5 shadow-sm border border-border flex items-center justify-center shrink-0">
            <img src={logoImg} alt="Parivartan Logo" className="w-full h-full object-contain rounded-lg" />
          </div>
          <div className="hidden xs:block">
            <span className="text-xs sm:text-sm font-extrabold text-foreground block leading-tight">Parivartan Hostel</span>
            <span className="text-[9px] sm:text-[10px] text-black/50 dark:text-white/50 font-medium">Surendranagar</span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mode switcher pills on mobile */}
          <div className="flex p-0.5 bg-black/5 dark:bg-white/10 rounded-xl border border-border/50">
            <button
              type="button"
              onClick={() => {
                setMobileTab('login');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                mobileTab === 'login'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-black/60 dark:text-white/60 hover:text-foreground'
              }`}
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileTab('about');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                mobileTab === 'about'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-black/60 dark:text-white/60 hover:text-foreground'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>About Us</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/about')}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/60 border border-primary-200 dark:border-primary-800 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            title="Open Dedicated About Us Page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">About Page</span>
          </button>

          <button 
            type="button"
            onClick={toggleTheme} 
            className="p-1.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors border border-border/50 text-foreground text-xs cursor-pointer"
            title="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Left Side - Desktop About Us Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-950 via-primary-900 to-indigo-950 relative overflow-hidden flex-col justify-between p-8 xl:p-12 text-white h-screen">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-15 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-primary-400 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute -left-16 top-1/4 w-80 h-80 bg-primary-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
        <div className="absolute -right-16 bottom-1/4 w-80 h-80 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

        {/* Scrollable About Us Content */}
        <div className="relative z-10 overflow-y-auto max-h-full pr-3 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <AboutUsContent onNavigateToAbout={() => navigate('/about')} />
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login / OTP Form or Mobile About View */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-6 sm:p-8 relative min-h-[calc(100vh-60px)] lg:min-h-screen">
        <button 
          onClick={toggleTheme} 
          className="hidden lg:block absolute top-8 right-8 p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors border border-border/50 text-foreground cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {/* Mobile Full About Us View (Active when mobile tab is 'about') */}
        {mobileTab === 'about' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="lg:hidden w-full max-w-md mx-auto p-5 sm:p-6 bg-gradient-to-br from-primary-950 via-primary-900 to-indigo-950 text-white rounded-3xl shadow-2xl border border-primary-800/50 space-y-6 my-2"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <button
                type="button"
                onClick={() => setMobileTab('login')}
                className="text-xs font-bold text-primary-200 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="text-xs font-bold text-primary-300 hover:text-white flex items-center gap-1 cursor-pointer hover:underline"
              >
                Full Page <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <AboutUsContent onNavigateToAbout={() => navigate('/about')} />

            <div className="pt-4 border-t border-white/15 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setMobileTab('login')}
                className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-900/50 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Go to Sign In Portal
              </button>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-primary-100 font-semibold text-xs flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
              >
                <span>Open Standalone About Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Login / OTP / Forgot Password Card Container */}
        {mobileTab === 'login' && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo Header */}
          <div className="flex flex-col items-center gap-2 mb-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-zinc-900 p-1.5 shadow-md border border-border flex items-center justify-center">
              <img src={logoImg} alt="Parivartan Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Parivartan Hostel</h1>
              <p className="text-xs text-black/50 dark:text-white/50">Hostel Management Portal</p>
            </div>
          </div>

          <Card className="border-none shadow-xl bg-white/50 dark:bg-black/20 backdrop-blur-xl">
            <AnimatePresence mode="wait">
              {step === 'credentials' && (
                /* STEP 1: Standard Login Form */
                <motion.div
                  key="credentials-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold text-center">Welcome back</CardTitle>
                    <CardDescription className="text-center text-base">
                      Enter your details to sign in to your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Role Selection Toggle */}
                    <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg mb-6">
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'student' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
                        onClick={() => setRole('student')}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'admin' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
                        onClick={() => setRole('admin')}
                      >
                        Admin / Sir
                      </button>
                    </div>

                    {successMessage && (
                      <div className="p-3 mb-4 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 mb-4 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="loginIdentifier" className="text-xs font-semibold block text-foreground">
                          {role === 'admin' ? 'Email Address *' : 'Student ID / Email / Phone *'}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                          <Input 
                            id="loginIdentifier"
                            name="loginIdentifier"
                            autoComplete="username"
                            type="text" 
                            placeholder={role === 'admin' ? 'vallabhdharejiya9@gmail.com' : 'STU-2026-001 / 9876543210'} 
                            className="pl-10 h-11 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label htmlFor="loginPassword" className="text-xs font-semibold block text-foreground">
                            Password *
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setError('');
                              setSuccessMessage('');
                              setForgotEmail(email);
                              setStep('forgot_request');
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold hover:underline cursor-pointer"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                          <Input 
                            id="loginPassword"
                            name="loginPassword"
                            autoComplete="current-password"
                            type="password" 
                            placeholder="••••••••" 
                            className="pl-10 h-11 text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-11 text-sm font-semibold gap-2 mt-2 shadow-md shadow-primary-500/20" 
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Signing In...
                          </>
                        ) : (
                          <>
                            Sign In <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </motion.div>
              )}

              {step === 'first_login_otp' && (
                /* STEP 2: First-Time Login Email Verification */
                <motion.div
                  key="first-login-otp-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-1 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-2">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">First-Time Email Verification</CardTitle>
                    <CardDescription className="text-center text-xs">
                      To secure your account, please verify your email address. We sent a 6-digit code to:
                      <span className="block font-semibold text-foreground mt-1 text-sm">
                        {maskedEmail}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {successMessage && (
                      <div className="p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleVerifyFirstLoginOtp} className="space-y-5">
                      <div>
                        <label htmlFor="firstOtpBox-0" className="text-xs font-semibold block text-center mb-3 text-foreground">
                          Enter 6-Digit Verification Code
                        </label>
                        
                        <div className="flex justify-center items-center gap-1.5 sm:gap-3" onPaste={handleOtpPaste}>
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => (otpInputRefs.current[index] = el)}
                              id={'firstOtpBox-' + index}
                              name={'firstOtpBox-' + index}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-2xl font-bold rounded-xl border border-border bg-black/[0.03] dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                              required
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-center text-black/50 dark:text-white/50 block mt-2">
                          Once verified, future logins will sign in directly.
                        </span>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading || otp.join('').length < 6}
                        className="w-full h-11 text-sm font-semibold gap-2 shadow-md shadow-primary-500/20" 
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Code...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Verify Email & Sign In
                          </>
                        )}
                      </Button>

                      {/* Resend & Back Actions */}
                      <div className="pt-2 flex flex-col items-center gap-3 border-t border-border text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-black/60 dark:text-white/60">Didn't receive the email?</span>
                          {canResend ? (
                            <button
                              type="button"
                              onClick={handleResendLoginOtp}
                              disabled={resendLoading}
                              className="font-bold text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {resendLoading ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                                </>
                              ) : (
                                'Resend Code'
                              )}
                            </button>
                          ) : (
                            <span className="font-semibold text-black/40 dark:text-white/40">
                              Resend in {resendTimer}s
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleBackToLogin}
                          className="text-black/60 dark:text-white/60 hover:text-foreground hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </motion.div>
              )}

              {step === 'forgot_request' && (
                /* STEP 3: Forgot Password - Request Reset Code */
                <motion.div
                  key="forgot-request-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-1 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
                    <CardDescription className="text-center text-xs">
                      Enter your account details to receive a 6-digit password reset verification code on your registered email.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Role Selection Toggle */}
                    <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg mb-2">
                      <button
                        type="button"
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${role === 'student' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
                        onClick={() => setRole('student')}
                      >
                        Student
                      </button>
                      <button
                        type="button"
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${role === 'admin' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
                        onClick={() => setRole('admin')}
                      >
                        Admin
                      </button>
                    </div>

                    {error && (
                      <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="forgotIdentifier" className="text-xs font-semibold block text-foreground">
                          {role === 'admin' ? 'Registered Email Address *' : 'Student ID / Registered Email / Phone *'}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                          <Input 
                            id="forgotIdentifier"
                            name="forgotIdentifier"
                            type="text" 
                            placeholder={role === 'admin' ? 'vallabhdharejiya9@gmail.com' : 'STU-2026-001 / 9876543210'} 
                            className="pl-10 h-11 text-sm"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading || !forgotEmail}
                        className="w-full h-11 text-sm font-semibold gap-2 mt-2 shadow-md shadow-amber-500/20 bg-amber-600 hover:bg-amber-700 text-white" 
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Sending Reset Code...
                          </>
                        ) : (
                          <>
                            Send Reset Code <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>

                      <div className="pt-2 text-center border-t border-border">
                        <button
                          type="button"
                          onClick={handleBackToLogin}
                          className="text-xs text-black/60 dark:text-white/60 hover:text-foreground hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </motion.div>
              )}

              {step === 'forgot_verify' && (
                /* STEP 4: Forgot Password - Enter OTP & New Password */
                <motion.div
                  key="forgot-verify-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardHeader className="space-y-1 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2">
                      <Lock className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-center">Set New Password</CardTitle>
                    <CardDescription className="text-center text-xs">
                      Enter the 6-digit code sent to:
                      <span className="block font-semibold text-foreground mt-1 text-sm">
                        {maskedEmail}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {successMessage && (
                      <div className="p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{successMessage}</span>
                      </div>
                    )}

                    {error && (
                      <div className="p-3 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl">
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="resetOtpBox-0" className="text-xs font-semibold block text-center mb-2.5 text-foreground">
                          Enter 6-Digit Password Reset Code
                        </label>
                        
                        <div className="flex justify-center items-center gap-1.5 sm:gap-3" onPaste={handleOtpPaste}>
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => (otpInputRefs.current[index] = el)}
                              id={'resetOtpBox-' + index}
                              name={'resetOtpBox-' + index}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-2xl font-bold rounded-xl border border-border bg-black/[0.03] dark:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                              required
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="resetNewPassword" className="text-xs font-semibold block text-foreground">
                          New Password * (Min 6 characters)
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                          <Input 
                            id="resetNewPassword"
                            name="resetNewPassword"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className="pl-10 pr-10 h-10 text-sm"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-2.5 text-black/40 dark:text-white/40 hover:text-foreground cursor-pointer"
                          >
                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="resetConfirmPassword" className="text-xs font-semibold block text-foreground">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                          <Input 
                            id="resetConfirmPassword"
                            name="resetConfirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••" 
                            className="pl-10 pr-10 h-10 text-sm"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-black/40 dark:text-white/40 hover:text-foreground cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading || otp.join('').length < 6 || !newPassword || !confirmPassword}
                        className="w-full h-11 text-sm font-semibold gap-2 mt-2 shadow-md shadow-amber-500/20 bg-amber-600 hover:bg-amber-700 text-white" 
                        size="lg"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Resetting Password...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" /> Reset Password & Continue
                          </>
                        )}
                      </Button>

                      {/* Resend & Back Actions */}
                      <div className="pt-2 flex flex-col items-center gap-3 border-t border-border text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-black/60 dark:text-white/60">Didn't receive the reset code?</span>
                          {canResend ? (
                            <button
                              type="button"
                              onClick={handleResendResetOtp}
                              disabled={resendLoading}
                              className="font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {resendLoading ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                                </>
                              ) : (
                                'Resend Code'
                              )}
                            </button>
                          ) : (
                            <span className="font-semibold text-black/40 dark:text-white/40">
                              Resend in {resendTimer}s
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleBackToLogin}
                          className="text-black/60 dark:text-white/60 hover:text-foreground hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                        </button>
                      </div>
                    </form>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Mobile Full About Us Section (Directly visible on mobile screens below login card) */}
          <div className="mt-8 pt-6 border-t border-border/70 lg:hidden space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-foreground leading-tight">About Parivartan Hostel</h3>
                  <p className="text-[10px] text-black/50 dark:text-white/50">Surendranagar • Est. 2012</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Full Page</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-primary-950 via-primary-900 to-indigo-950 text-white shadow-xl border border-primary-800/40 relative overflow-hidden space-y-5">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <AboutUsContent onNavigateToAbout={() => navigate('/about')} />

              <div className="pt-3 border-t border-white/15 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Open Full About Us Page & Gallery</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </div>
    </div>
  );
};

export default Login;
