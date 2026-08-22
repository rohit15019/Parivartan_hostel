import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
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
  Image as ImageIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

import logoImg from '../../assets/logo.png';
import eventTrainingImg from '../../assets/event_training.jpg';
import hostelCampusImg from '../../assets/hostel_campus.jpg';
import hostelBuildingImg from '../../assets/hostel_building.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const { login, user, token } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (token && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [token, user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const loggedUser = await login(email, password, role);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - About Us Panel */}
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
            className="space-y-6"
          >
            {/* Header / Brand */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-4">
                <button 
                  onClick={() => navigate('/about')}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-primary-200 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer group shadow-sm hover:scale-105"
                  title="Click to open full About Us page"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary-300 group-hover:rotate-12 transition-transform" />
                  <span>About Us</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('/about')}
                  className="text-xs font-semibold text-primary-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer hover:underline"
                >
                  <span>Full Page View</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex items-center gap-3.5 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-lg shrink-0 flex items-center justify-center border border-white/20">
                  <img src={logoImg} alt="Parivartan Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight">
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
                <span className="text-sm font-bold tracking-wide text-white flex items-center justify-center gap-2">
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
                  onClick={() => navigate('/about')}
                  className="text-[11px] text-primary-300 hover:text-white flex items-center gap-1 transition-colors hover:underline"
                >
                  View All Photos <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div 
                onClick={() => navigate('/about')}
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
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <button 
          onClick={toggleTheme} 
          className="absolute top-8 right-8 p-2.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors border border-border/50 text-foreground"
          title="Toggle Theme"
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
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
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center text-base">
                Enter your details to sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Role Selection Toggle */}
              <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-lg mb-8">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'student' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
                  onClick={() => setRole('student')}
                >
                  Student
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'admin' ? 'bg-white dark:bg-zinc-800 shadow-sm text-foreground' : 'text-black/60 dark:text-white/60 hover:text-foreground'}`}
                  onClick={() => setRole('admin')}
                >
                  Admin / Sir
                </button>
              </div>

              {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg">{error}</div>}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium leading-none text-foreground">
                    {role === 'admin' ? 'Email Address' : 'Student ID / Email / Phone'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                    <Input 
                      id="username"
                      name="username"
                      autoComplete="username"
                      type="text" 
                      placeholder={role === 'admin' ? 'admin@hostel.com' : 'STU-2026-001 / 9876543210'} 
                      className="pl-10 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none text-foreground">
                      Password
                    </label>
                    <a href="#" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                    <Input 
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      type="password" 
                      placeholder="••••••••" 
                      className="pl-10 h-11"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11 text-base gap-2 mt-4" size="lg">
                  Sign In <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
