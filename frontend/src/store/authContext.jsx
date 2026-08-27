import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('collegerag_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
        } catch (err) {
          console.error('Failed to load current user from stored token', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('collegerag_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, role = 'STUDENT') => {
    const res = await authApi.register(name, email, password, role);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('collegerag_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('collegerag_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
