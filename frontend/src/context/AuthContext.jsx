import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('opd_token') || null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Auth error', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.success) {
      const data = res.data.data;
      localStorage.setItem('opd_token', data.token);
      setToken(data.token);
      setUser({
        id: data.userId,
        email: data.username,
        fullName: data.fullName,
        role: data.role,
        patientId: data.patientId,
        doctorId: data.doctorId,
      });
      return data;
    } else {
      throw new Error(res.data.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('opd_token');
    setToken(null);
    setUser(null);
  };

  // Demo 1-click fast login helper
  const demoLogin = async (email) => {
    const passwordMap = {
      'altaf.student@amu.ac.in': 'pat123',
      'kamran.emp@amu.ac.in': 'pat123',
      'ramesh.sharma@gmail.com': 'pat123',
      'zahmed@amu.ac.in': 'doc123',
      'fzahra@amu.ac.in': 'doc123',

      'reception@amu.ac.in': 'rec123',
      'admin@amu.ac.in': 'admin123'
    };
    const password = passwordMap[email] || 'password123';
    return login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, demoLogin, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
