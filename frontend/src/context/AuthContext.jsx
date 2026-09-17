import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('polarlogix_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('polarlogix_token'));
  const [loading, setLoading] = useState(true);

  // Configure Axios defaults & interceptors
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('polarlogix_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('polarlogix_token');
    }
  }, [token]);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('polarlogix_token');
      if (savedToken) {
        try {
          const res = await axios.get(`${baseURL}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          setUser(res.data);
          localStorage.setItem('polarlogix_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await axios.post(`${baseURL}/auth/login`, {
      username: username.trim(),
      password
    });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('polarlogix_token', access_token);
    localStorage.setItem('polarlogix_user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    return userData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('polarlogix_token');
    localStorage.removeItem('polarlogix_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
