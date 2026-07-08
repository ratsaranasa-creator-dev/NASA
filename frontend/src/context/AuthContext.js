import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import jwtDecode from 'jwt-decode';
import api from '../apiConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setLoading(false);
  }, []);

  const fetchProfile = useCallback(async (token) => {
    try {
      const { data } = await api.get('/api/auth/profile');
      setUser(data);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          // Fetch user profile from backend
          fetchProfile(token);
        }
      } catch (error) {
        logout();
      }
    } else {
      setLoading(false);
    }
  }, [fetchProfile, logout]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    // Note: userData might be FormData if there's a profile picture
    const { data } = await api.post('/api/auth/register', userData);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
