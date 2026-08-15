import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const navigate = useNavigate();
  const { toggleTheme, theme } = useTheme();
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password, role);
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-primary-900 relative overflow-hidden items-center justify-center">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -left-10 top-1/4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -right-10 top-1/3 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="z-10 text-white p-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                <Building2 className="w-8 h-8 text-primary-300" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">StayEase Hostel</h1>
            </div>
            
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Manage Your Hostel. <span className="text-primary-300">Smarter.</span>
            </h2>
            <p className="text-xl text-primary-100/80 mb-12 leading-relaxed">
              Fees, students, rooms and leave requests — everything in one beautiful, professional workspace.
            </p>

            {/* Testimonial / Social Proof */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm">
              <div className="flex gap-4 items-center">
                <div className="flex -space-x-4">
                  {[1, 2, 3].map((i) => (
                    <img key={i} className="w-12 h-12 rounded-full border-2 border-primary-900" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                  ))}
                </div>
                <div>
                  <p className="font-medium">Trusted by 500+ Students</p>
                  <p className="text-sm text-primary-200">Join the smartest hostel community.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        <button onClick={toggleTheme} className="absolute top-8 right-8 p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
             <div className="p-3 bg-primary-100 dark:bg-primary-900/50 rounded-xl">
                <Building2 className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">StayEase</h1>
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
                  <label className="text-sm font-medium leading-none text-foreground">
                    {role === 'admin' ? 'Email Address' : 'Student ID / Email / Phone'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                    <Input 
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
                    <label className="text-sm font-medium leading-none text-foreground">
                      Password
                    </label>
                    <a href="#" className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-black/40 dark:text-white/40" />
                    <Input 
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
