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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Person as PersonIcon,
  School as SchoolIcon,
  Badge as BadgeIcon,
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const departments = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
];

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [academicYear, setAcademicYear] = useState('');
  const theme = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    
    // Get form data
    const formData = {
      firstName: data.get('firstName')?.trim(),
      lastName: data.get('lastName')?.trim(),
      username: data.get('username')?.trim(),
      email: data.get('email')?.trim(),
      password: data.get('password'),
      confirmPassword: data.get('confirmPassword'),
      role: role,
      ...(role === 'student' && {
        studentId: data.get('studentId')?.trim(),
        academicYear: parseInt(academicYear, 10),
      }),
      ...(role === 'teacher' && {
        department: data.get('department'),
      }),
    };

    // Log form data for debugging
    console.log('Form data being submitted:', {
      ...formData,
      password: '[REDACTED]',
      confirmPassword: '[REDACTED]'
    });

    // Enhanced validation
    if (!formData.firstName || !formData.lastName) {
      setError('Please provide both first and last name');
      return;
    }

    if (!formData.username) {
      setError('Please provide a username');
      return;
    }

    if (!formData.email) {
      setError('Please provide an email address');
      return;
    }

    const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (role === 'student') {
      if (!formData.studentId) {
        setError('Please provide a student ID');
        return;
      }
      if (!formData.academicYear) {
        setError('Please select an academic year');
        return;
      }
      if (isNaN(formData.academicYear) || formData.academicYear < 1 || formData.academicYear > 4) {
        setError('Academic year must be between 1 and 4');
        return;
      }
    }

    if (role === 'teacher' && !formData.department) {
      setError('Please select a department');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(formData);
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register. Please try again.');
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
      <Container component="main" maxWidth="sm">
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
            py: 4,
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
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Fill in your details to create your account
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="firstName"
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
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
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="lastName"
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="action" />
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                type="email"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                disabled={loading}
                helperText="Password must be at least 6 characters long"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
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
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            </Grid>
            <Grid item xs={12}>
                  <FormControl
                    fullWidth
                    required
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
                  >
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  id="role"
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <SchoolIcon color="action" />
                        </InputAdornment>
                      }
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Conditional fields based on role */}
            {role === 'student' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="studentId"
                    label="Student ID"
                    name="studentId"
                    disabled={loading}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeIcon color="action" />
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
                </Grid>
                <Grid item xs={12}>
                      <FormControl
                        fullWidth
                        required
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
                      >
                    <InputLabel id="academic-year-label">Academic Year</InputLabel>
                    <Select
                      labelId="academic-year-label"
                      id="academicYear"
                      name="academicYear"
                      label="Academic Year"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      disabled={loading}
                          startAdornment={
                            <InputAdornment position="start">
                              <SchoolIcon color="action" />
                            </InputAdornment>
                          }
                    >
                      <MenuItem value={1}>First Year</MenuItem>
                      <MenuItem value={2}>Second Year</MenuItem>
                      <MenuItem value={3}>Third Year</MenuItem>
                      <MenuItem value={4}>Fourth Year</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {role === 'teacher' && (
              <Grid item xs={12}>
                    <FormControl
                      fullWidth
                      required
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
                    >
                  <InputLabel id="department-label">Department</InputLabel>
                  <Select
                    labelId="department-label"
                    id="department"
                    name="department"
                    label="Department"
                    defaultValue=""
                        startAdornment={
                          <InputAdornment position="start">
                            <AccountBalanceIcon color="action" />
                          </InputAdornment>
                        }
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>

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
                    <span>Creating Account...</span>
                  </Box>
                ) : (
                  'Create Account'
                )}
          </Button>

          <Grid container justifyContent="flex-end">
            <Grid item>
                  <Link
                    component={RouterLink}
                    to="/login"
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
                Already have an account? Sign in
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

export default Register; 