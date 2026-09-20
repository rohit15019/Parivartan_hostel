import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync profile details (name, photo) in background when logged in as student
  useEffect(() => {
    if (token && user?.role === 'student') {
      api.get('/students/profile')
        .then(res => {
          if (res.data) {
            const fullName = `${res.data.name || ''}${res.data.surname ? ' ' + res.data.surname : ''}`.trim();
            setUser(prev => {
              if (!prev) return prev;
              const nextUser = {
                ...prev,
                name: fullName || prev.name,
                photo: res.data.photo || prev.photo || '',
              };
              localStorage.setItem('user', JSON.stringify(nextUser));
              return nextUser;
            });
          }
        })
        .catch(err => {
          if (err.response?.status === 401) {
            logout();
          }
        });
    }
  }, [token]);

  // Step 1: Send credentials (triggers OTP on first login, or signs in directly if already verified)
  const login = async (email, password, role) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, role });
      
      // If server asks for OTP verification (first login)
      if (data.requiresOtp) {
        return data;
      }

      // Direct login (when already verified)
      if (data.token) {
        setToken(data.token);
        setUser(data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
      }
      
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed. Please check your credentials.';
    }
  };

  // Step 2: Verify 6-digit OTP and complete first-time session authorization
  const verifyOtp = async (tempToken, otp) => {
    try {
      const { data } = await api.post('/auth/verify-otp', { tempToken, otp });
      
      setToken(data.token);
      setUser(data);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to verify code. Please try again.';
    }
  };

  // Resend fresh login OTP
  const resendOtp = async (tempToken) => {
    try {
      const { data } = await api.post('/auth/resend-otp', { tempToken });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to resend verification code.';
    }
  };

  // Forgot Password: Send Reset OTP
  const requestForgotPassword = async (email, role) => {
    try {
      const { data } = await api.post('/auth/forgot-password', { email, role });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to initiate password reset.';
    }
  };

  // Reset Password: Submit New Password & OTP
  const resetPassword = async (tempToken, otp, newPassword) => {
    try {
      const { data } = await api.post('/auth/reset-password', { tempToken, otp, newPassword });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to reset password. Please try again.';
    }
  };

  // Resend Password Reset OTP
  const resendResetOtp = async (tempToken) => {
    try {
      const { data } = await api.post('/auth/resend-reset-otp', { tempToken });
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Failed to resend reset code.';
    }
  };

  const updateUser = (updatedFields) => {
    setUser(prev => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    verifyOtp,
    resendOtp,
    requestForgotPassword,
    resetPassword,
    resendResetOtp,
    updateUser,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
