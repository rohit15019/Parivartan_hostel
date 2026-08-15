import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Restore user from token on load (basic implementation - normally you'd fetch /api/auth/me)
  useEffect(() => {
    if (token) {
      try {
        // In a real app, you'd fetch the user profile here to restore state.
        // Since we don't have a /api/auth/me, we'll extract basic info if available in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // If this is an old session without the name, fetch it
          if (parsedUser.role === 'student' && !parsedUser.name) {
            api.get('/students/profile').then(res => {
              const updatedUser = { ...parsedUser, name: res.data.name };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }).catch(console.error);
          }
        }
      } catch (e) {
        console.error("Failed to restore session", e);
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password, role) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, role });
      
      setToken(data.token);
      setUser(data);
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      
      return data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
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
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
