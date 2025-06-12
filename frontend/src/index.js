import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import App from './App';
import axios from 'axios';

// Set default axios config
const isProd = process.env.NODE_ENV === 'production';
const API_URL = isProd 
  ? 'https://student-feedback-backend-q161.onrender.com'  // Current backend URL
  : 'http://localhost:4000';

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Log configuration in development
if (!isProd) {
  console.log('API Configuration:', {
    baseURL: API_URL,
    environment: process.env.NODE_ENV,
    withCredentials: axios.defaults.withCredentials,
    headers: axios.defaults.headers.common
  });
}

// Set up axios interceptors for error handling
axios.interceptors.request.use(
  (config) => {
    if (!isProd) {
      console.log('Making request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        withCredentials: config.withCredentials
      });
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      baseURL: error.config?.baseURL
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Set auth token if it exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <StyledEngineProvider injectFirst>
      <CssBaseline />
      <App />
    </StyledEngineProvider>
  </React.StrictMode>
);
