import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    
    // Client-side validation
    const email = data.get('email')?.trim();
    const password = data.get('password');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      console.log('Attempting login with:', { email, apiUrl: axios.defaults.baseURL });
      await login(email, password);
      console.log('Login successful, navigating to dashboard');
      navigate('/');
    } catch (error) {
      console.error('Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError(error.message || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0) 70%)'
            : 'radial-gradient(circle at 50% 50%, rgba(33, 150, 243, 0.2) 0%, rgba(33, 150, 243, 0) 70%)',
          animation: 'pulse 15s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%': {
            transform: 'scale(1)',
            opacity: 0.5,
          },
          '50%': {
            transform: 'scale(1.5)',
            opacity: 0.7,
          },
          '100%': {
            transform: 'scale(1)',
            opacity: 0.5,
          },
        },
      }}
    >
    <Container component="main" maxWidth="xs">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <MotionPaper
            elevation={3}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
            sx={{
              p: 4,
              width: '100%',
              borderRadius: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, rgba(30, 30, 30, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%)'
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 245, 245, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(255, 255, 255, 0.5)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(31, 38, 135, 0.1)',
            }}
          >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
                gap: 2,
        }}
      >
              <Avatar
                sx={{
                  m: 1,
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 32 }} />
        </Avatar>
              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Please sign in to continue to your dashboard
        </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
              <AnimatePresence mode="wait">
          {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Alert
                      severity="error"
                      sx={{
                        mb: 2,
                        borderRadius: 2,
                        animation: 'shake 0.5s',
                        '@keyframes shake': {
                          '0%, 100%': { transform: 'translateX(0)' },
                          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
                        },
                      }}
                    >
              {error}
            </Alert>
                  </motion.div>
          )}
              </AnimatePresence>

          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
                label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                  },
                }}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
                type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                  },
                }}
              />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,118,255,0.39)',
                  },
                  '&:disabled': {
                    background: theme.palette.action.disabledBackground,
                  },
                }}
          >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Signing in...</span>
                  </Box>
                ) : (
                  'Sign In'
                )}
          </Button>

          <Grid container justifyContent="flex-end">
            <Grid item>
                  <Link
                    component={RouterLink}
                    to="/register"
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        color: 'primary.dark',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </Box>
          </MotionPaper>
        </MotionBox>
      </Container>
      </Box>
  );
}

export default Login; 