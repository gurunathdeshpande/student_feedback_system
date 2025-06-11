import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import FeedbackForm from './components/FeedbackForm';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider>
        <CssBaseline />
        <Router>
        <AuthProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </PrivateRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Analytics />
                    </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/feedback/new"
                  element={
                    <PrivateRoute>
                    <Layout>
                      <FeedbackForm />
                    </Layout>
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/feedback/edit/:id"
                  element={
                    <PrivateRoute>
                    <Layout>
                      <FeedbackForm />
                    </Layout>
                    </PrivateRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
          </AuthProvider>
          </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;