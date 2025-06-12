import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Configure axios defaults
const isProd = process.env.NODE_ENV === 'production';
const API_URL = isProd 
  ? 'https://student-feedback-backend-q161.onrender.com'
  : 'http://localhost:8080';

// Set up axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.withCredentials = true;

// Add request interceptor for debugging
axios.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url, {
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axios.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      // Set auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const response = await axios.get('/api/me');
      if (response.data.success) {
        setUser(response.data.data);
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/login', {
        username: username.toLowerCase(),
        password
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { token, user } = response.data;
      
      // Save token and set auth header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to login. Please check your credentials.'
      );
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/register', {
        ...userData,
        username: userData.username.toLowerCase(),
        email: userData.email.toLowerCase()
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Registration failed');
      }

      const { token, user } = response.data;
      
      // Save token and set auth header
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update user state
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again.'
      );
    }
  };

  const logout = () => {
    handleLogout();
  };

  const handleLogout = () => {
    // Clear token and auth header
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset user state
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 