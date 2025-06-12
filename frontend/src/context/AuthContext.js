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
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get('/api/auth/me');
        if (response.data.success) {
      setUser(response.data.data);
        } else {
          handleLogout();
        }
      }
    } catch (error) {
      handleLogout();
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, baseURL: axios.defaults.baseURL });
      
      const response = await axios.post('/api/auth/login', { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('Login response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login failed');
      }

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      });
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      // Validate required fields
      const requiredFields = ['username', 'email', 'password', 'firstName', 'lastName', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Role-specific validation
      if (userData.role === 'student') {
        if (!userData.studentId || !userData.academicYear) {
          throw new Error('Student ID and Academic Year are required for students');
        }
      } else if (userData.role === 'teacher') {
        if (!userData.department) {
          throw new Error('Department is required for teachers');
        }
      }

      // Log the data being sent
      console.log('Sending registration data:', {
        ...userData,
        password: '[REDACTED]',
        confirmPassword: '[REDACTED]'
      });

      const response = await axios.post('/api/auth/register', userData);
      
      if (!response.data.success) {
        throw new Error(response.data.error || response.data.message || 'Registration failed');
      }

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Registration error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    handleLogout();
    navigate('/login');
  };

  const updateUser = async (userData) => {
    try {
      const response = await axios.put('/api/auth/update-profile', userData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }

      setUser(response.data.data);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 