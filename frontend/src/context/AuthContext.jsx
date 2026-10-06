import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tradeez_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current user
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('tradeez_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.error('Failed to authenticate token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchMe();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('tradeez_token', receivedToken);
    localStorage.setItem('tradeez_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token: receivedToken, user: receivedUser } = res.data;
    localStorage.setItem('tradeez_token', receivedToken);
    localStorage.setItem('tradeez_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return receivedUser;
  };

  const logout = () => {
    localStorage.removeItem('tradeez_token');
    localStorage.removeItem('tradeez_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error('Could not refresh user profile:', err);
    }
  };

  const resetBalance = async () => {
    try {
      const res = await authAPI.resetBalance();
      setUser(prev => ({ ...prev, virtualBalance: res.data.virtualBalance }));
      return res.data;
    } catch (err) {
      console.error('Failed to reset balance:', err);
      throw err;
    }
  };

  // Demo 1-click accounts
  const loginDemoTrader = async () => {
    return await login('trader@stockez.com', 'Password123!');
  };

  const loginDemoAdmin = async () => {
    return await login('admin@stockez.com', 'Password123!');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    loading,
    login,
    register,
    logout,
    refreshUser,
    resetBalance,
    loginDemoTrader,
    loginDemoAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
