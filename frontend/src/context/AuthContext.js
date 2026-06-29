import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

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
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/profile`, config);
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
    const { data } = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/register`, userData);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
