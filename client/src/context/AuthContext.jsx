import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('imovies_token') || null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type = 'info') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 4500);
  };

  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
      } catch (err) {
        console.error('Session expired:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('imovies_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      showAlert('Welcome back, ' + receivedUser.name + '!', 'success');
      return { success: true };
    } catch (err) {
      showAlert(err.message, 'danger');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      const { token: receivedToken, user: receivedUser } = res.data;
      localStorage.setItem('imovies_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      showAlert('Account created successfully! Welcome to IMovies.', 'success');
      return { success: true };
    } catch (err) {
      showAlert(err.message, 'danger');
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('imovies_token');
    setToken(null);
    setUser(null);
    showAlert('You have been logged out safely.', 'info');
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/auth/profile', data);
      setUser(res.data.user);
      showAlert('Profile updated successfully!', 'success');
      return { success: true };
    } catch (err) {
      showAlert(err.message, 'danger');
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      alert,
      showAlert,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);