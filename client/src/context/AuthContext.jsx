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
