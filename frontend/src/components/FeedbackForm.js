import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  RadioGroup,
  Radio,
  FormControlLabel,
  Stack,
  Checkbox,
  Alert,
  Snackbar,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Rating,
  useTheme,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Subject as SubjectIcon,
  Comment as CommentIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Edit as EditIcon,
  CheckCircleOutline as CheckCircleIcon,
  PendingActions as PendingIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const steps = ['Select Teacher & Subject', 'Provide Feedback', 'Additional Details'];

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Other',
];

const FeedbackForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    teacher: '',
    subject: '',
    content: '',
    rating: 5,
    semester: '',
    academicYear: '',
    isAnonymous: false,
    status: 'pending',
    teacherResponse: '',
  });
  const [teachers, setTeachers] = useState([]);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const loadData = async () => {
      if (user.role === 'student') {
        await fetchTeachers();
      }
      if (id) {
        setIsEditing(true);
        await fetchFeedback();
      } else {
        calculateAcademicYear();
      }
    };
    loadData();
  }, [id, user.role]);

  const calculateAcademicYear = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    let academicYear;
    if (month >= 7) {
      academicYear = `${currentYear}-${currentYear + 1}`;
    } else {
      academicYear = `${currentYear - 1}-${currentYear}`;
    }
    
    setFormData(prev => ({ ...prev, academicYear }));
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/auth/teachers');
      if (response.data && response.data.data) {
        setTeachers(response.data.data);
      } else {
        setTeachers([]);
      }
    } catch (error) {
      setToast({
        open: true,
        message: error.response?.data?.message || 'Error fetching teachers',
        severity: 'error'
      });
      setTeachers([]);
    }
  };

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`/api/feedback/${id}`);
      if (!response.data.success) {
        throw new Error('Failed to fetch feedback');
      }
      
      const feedback = response.data.data;
      
      // Check if user has permission to edit this feedback
      if (user.role === 'student' && feedback.student._id !== user.id) {
        throw new Error('Not authorized to edit this feedback');
      }
      if (user.role === 'teacher' && feedback.teacher._id !== user.id) {
        throw new Error('Not authorized to edit this feedback');
      }

      setFormData({
        teacher: feedback.teacher._id,
        subject: feedback.subject,
        content: feedback.content,
        rating: feedback.rating,
        semester: feedback.semester,
        academicYear: feedback.academicYear,
        isAnonymous: feedback.isAnonymous,
        status: feedback.status || 'pending',
        teacherResponse: feedback.teacherResponse || '',
      });
      setCurrentStep(1);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || error.message || 'Error fetching feedback',
        severity: 'error'
      });
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  const validateFormData = () => {
    const newErrors = {};
    
    // Basic required field validation
    if (!formData.teacher) newErrors.teacher = 'Teacher is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.content || formData.content.trim().length < 10) {
      newErrors.content = 'Feedback content must be at least 10 characters';
    }
    if (!formData.rating) newErrors.rating = 'Rating is required';
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';

    // Additional validation for teacher response when editing
    if (user.role === 'teacher' && isEditing) {
      if (!formData.status) newErrors.status = 'Status is required';
      if (!formData.teacherResponse || formData.teacherResponse.trim().length < 10) {
        newErrors.teacherResponse = 'Response must be at least 10 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.teacher) newErrors.teacher = 'Teacher is required';
        if (!formData.subject) newErrors.subject = 'Subject is required';
        break;
      case 2:
        if (!formData.content || formData.content.trim().length < 10) {
          newErrors.content = 'Feedback content must be at least 10 characters';
        }
        if (!formData.rating) newErrors.rating = 'Rating is required';
        break;
      case 3:
        if (!formData.semester) {
          newErrors.semester = 'Semester is required';
        } else if (formData.semester < 1 || formData.semester > 4) {
          newErrors.semester = 'Semester must be between 1 and 4';
        }
        if (!formData.academicYear) {
          newErrors.academicYear = 'Academic year is required';
        } else if (!/^\d{4}-\d{4}$/.test(formData.academicYear)) {
          newErrors.academicYear = 'Invalid academic year format (YYYY-YYYY)';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log formData for debugging
    console.log('Submitting Feedback:', formData);

    // Validate all form fields
    if (!validateFormData()) {
      setToast({
        open: true,
        message: 'Please fill in all required fields correctly',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let endpoint = '/api/feedback';
      let payload;

      if (isEditing) {
        endpoint = `/api/feedback/${id}`;
        
        if (user.role === 'teacher') {
          payload = {
            status: formData.status,
            teacherResponse: formData.teacherResponse.trim()
          };
        } else {
          payload = {
            teacher: formData.teacher,
            subject: formData.subject.trim(),
            content: formData.content.trim(),
            rating: Number(formData.rating),
            semester: Number(formData.semester),
            academicYear: formData.academicYear,
            isAnonymous: formData.isAnonymous
          };
        }
        
        const response = await axios.put(endpoint, payload);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to update feedback');
        }
        
        setToast({
          open: true,
          message: 'Feedback updated successfully',
          severity: 'success'
        });
      } else {
        payload = {
          teacher: formData.teacher,
          subject: formData.subject.trim(),
          content: formData.content.trim(),
          rating: Number(formData.rating),
          semester: Number(formData.semester),
          academicYear: formData.academicYear,
          isAnonymous: formData.isAnonymous
        };
        
        const response = await axios.post(endpoint, payload);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to submit feedback');
        }
        
        setToast({
          open: true,
          message: 'Feedback submitted successfully',
          severity: 'success'
        });
      }
        
      // Redirect after successful submission
        setTimeout(() => {
          navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      const errorMessage = error.response?.data?.message || 
                          error.message ||
                          'An error occurred while submitting feedback';
      setToast({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              name === 'semester' ? parseInt(value, 10) : 
              name === 'rating' ? parseInt(value, 10) : 
              value,
    }));
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <Container maxWidth="md">
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ py: 4 }}
      >
        <Typography
          component="h1"
          variant="h4"
          align="center"
          sx={{
            mb: 4,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isEditing ? 'Edit Feedback' : 'Submit Feedback'}
        </Typography>

        {user.role === 'teacher' && isEditing ? (
          <MotionPaper
            component="form"
            onSubmit={handleSubmit}
            elevation={3}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            sx={{
              p: 4,
              borderRadius: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, rgba(40, 44, 52, 0.95) 0%, rgba(35, 39, 47, 0.95) 100%)'
                : 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 250, 250, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.05)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                : '0 8px 32px rgba(31, 38, 135, 0.15)',
            }}
          >
          <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <EditIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  color: 'transparent',
                }}>
                  Review Student Feedback
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

            <FormControl fullWidth>
                <InputLabel id="status-label" sx={{
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                }}>
                  Feedback Status
                </InputLabel>
              <Select
                  labelId="status-label"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                  label="Feedback Status"
                  error={!!errors.status}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2196F3',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#2196F3',
                    },
                  }}
              >
                  <MenuItem value="pending" sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <PendingIcon sx={{ color: '#ffa726' }} />
                    Pending Review
                  </MenuItem>
                  <MenuItem value="reviewed" sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <CheckCircleIcon sx={{ color: '#66bb6a' }} />
                    Reviewed
                  </MenuItem>
                  <MenuItem value="archived" sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <ArchiveIcon sx={{ color: '#9e9e9e' }} />
                    Archived
                  </MenuItem>
              </Select>
                {errors.status && (
                  <FormHelperText error>{errors.status}</FormHelperText>
                )}
            </FormControl>

              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
              }}>
                <Typography variant="subtitle1" sx={{ 
                  mb: 2,
                  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <CommentIcon fontSize="small" />
                  Your Response to Student
                </Typography>
              <TextField
                name="teacherResponse"
                value={formData.teacherResponse}
                onChange={handleInputChange}
                multiline
                  rows={6}
                  placeholder="Share your constructive feedback and suggestions..."
                  fullWidth
                  error={!!errors.teacherResponse}
                  helperText={errors.teacherResponse}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.01)',
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#2196F3',
                      },
                    },
                  }}
                />
              </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              fullWidth
                sx={{
                  mt: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  boxShadow: '0 4px 14px 0 rgba(33, 150, 243, 0.39)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1e88e5 30%, #1eb8e5 90%)',
                  },
                  '&:disabled': {
                    background: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.12)',
                  },
                }}
              >
                {isSubmitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CircularProgress size={20} color="inherit" />
                    <span>Submitting Response...</span>
                  </Box>
                ) : (
                  'Submit Feedback Response'
                )}
            </Button>
          </Stack>
          </MotionPaper>
        ) : (
          <>
            <MotionPaper
              elevation={0}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              sx={{
                p: 4,
                borderRadius: 3,
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                boxShadow: theme.shadows[2],
              }}
            >
              <Stepper activeStep={currentStep - 1} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box component="form" onSubmit={handleSubmit}>
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
                          mb: 3,
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

                <AnimatePresence mode="wait">
                  <MotionBox
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
            {currentStep === 1 && (
              <Stack spacing={3}>
                <FormControl fullWidth error={!!errors.teacher}>
                  <InputLabel>Teacher</InputLabel>
                  <Select
                    name="teacher"
                    value={formData.teacher}
                    onChange={handleInputChange}
                    label="Teacher"
                    disabled={isEditing}
                            startAdornment={<PersonIcon sx={{ ml: 1, mr: 2, color: 'action.active' }} />}
                            sx={{
                              borderRadius: 2,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                              },
                            }}
                  >
                    {Array.isArray(teachers) && teachers.map((teacher) => (
                      <MenuItem key={teacher._id} value={teacher._id}>
                        {`${teacher.firstName} ${teacher.lastName}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.teacher && <FormHelperText>{errors.teacher}</FormHelperText>}
                </FormControl>

                <FormControl fullWidth error={!!errors.subject}>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    label="Subject"
                            startAdornment={<SubjectIcon sx={{ ml: 1, mr: 2, color: 'action.active' }} />}
                            sx={{
                              borderRadius: 2,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#2196F3',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#2196F3',
                              },
                            }}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  maxHeight: 300,
                                  '& .MuiMenuItem-root': {
                                    padding: 2,
                                  },
                                },
                              },
                            }}
                          >
                            {subjects.map((subject) => (
                              <MenuItem 
                                key={subject} 
                                value={subject}
                                sx={{
                                  borderRadius: 1,
                                  mb: 0.5,
                                  '&:hover': {
                                    bgcolor: theme.palette.mode === 'dark' 
                                      ? 'rgba(255, 255, 255, 0.05)' 
                                      : 'rgba(33, 150, 243, 0.05)',
                                  },
                                }}
                              >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.05)' 
                                        : 'rgba(33, 150, 243, 0.05)',
                                    }}
                                  >
                                    <SubjectIcon color="primary" />
                                  </Box>
                                  <Typography variant="body2">{subject}</Typography>
                                </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                          {errors.subject && (
                            <FormHelperText error>{errors.subject}</FormHelperText>
                          )}
                </FormControl>
              </Stack>
            )}

            {currentStep === 2 && (
                      <Stack spacing={4}>
                <FormControl fullWidth error={!!errors.content}>
                  <TextField
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    label="Feedback Content"
                    multiline
                    rows={6}
                    error={!!errors.content}
                    helperText={errors.content}
                            placeholder="Share your thoughts and experiences..."
                            InputProps={{
                              startAdornment: (
                                <CommentIcon sx={{ mr: 2, color: 'action.active', alignSelf: 'flex-start', mt: 2 }} />
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.2s',
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.05)' 
                                    : 'rgba(33, 150, 243, 0.05)',
                                },
                              },
                            }}
                  />
                </FormControl>

                        <Box>
                          <Typography component="legend" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StarIcon sx={{ color: theme.palette.warning.main }} />
                            Rating
                          </Typography>
                          <Rating
                    name="rating"
                            value={formData.rating}
                            onChange={(event, newValue) => {
                              handleInputChange({
                                target: { name: 'rating', value: newValue }
                              });
                            }}
                            precision={1}
                            size="large"
                            sx={{
                              '& .MuiRating-iconFilled': {
                                color: theme.palette.warning.main,
                              },
                              '& .MuiRating-iconHover': {
                                color: theme.palette.warning.light,
                              },
                            }}
                          />
                        </Box>
              </Stack>
            )}

            {currentStep === 3 && (
              <Stack spacing={3}>
                <FormControl fullWidth error={!!errors.semester}>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    label="Semester"
                            startAdornment={<CalendarIcon sx={{ ml: 1, mr: 2, color: 'action.active' }} />}
                            sx={{
                              borderRadius: 2,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#2196F3',
                              },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#2196F3',
                              },
                            }}
                          >
                            {[...Array(4)].map((_, index) => (
                              <MenuItem 
                                key={index + 1} 
                                value={index + 1}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: theme.palette.primary.main,
                                    color: '#fff',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                  }}
                                >
                                  {index + 1}
                                </Box>
                                Semester {index + 1}
                      </MenuItem>
                    ))}
                  </Select>
                          {errors.semester && (
                            <FormHelperText error>{errors.semester}</FormHelperText>
                          )}
                </FormControl>

                <FormControl fullWidth error={!!errors.academicYear}>
                  <TextField
                    name="academicYear"
                    value={formData.academicYear}
                    label="Academic Year"
                    disabled={true}
                    error={!!errors.academicYear}
                    helperText={errors.academicYear}
                            InputProps={{
                              startAdornment: <SchoolIcon sx={{ mr: 2, color: 'action.active' }} />,
                            }}
                            sx={{
                              borderRadius: 2,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              },
                            }}
                  />
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      name="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={handleInputChange}
                              sx={{
                                '&.Mui-checked': {
                                  color: theme.palette.primary.main,
                                },
                              }}
                    />
                  }
                          label={
                            <Typography variant="body2" color="text.secondary">
                              Submit Anonymously
                            </Typography>
                          }
                />
              </Stack>
            )}
                  </MotionBox>
                </AnimatePresence>

                <Box
                  sx={{
                    mt: 4,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
              {currentStep > 1 && (
                    <Button
                      onClick={handlePrevious}
                      variant="outlined"
                      startIcon={<NavigateBeforeIcon />}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(33, 150, 243, 0.05)',
                        },
                      }}
                    >
                  Previous
                </Button>
              )}
                  
              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  variant="contained"
                      endIcon={<NavigateNextIcon />}
                      sx={{
                        ml: 'auto',
                        borderRadius: 2,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0,118,255,0.39)',
                        },
                      }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                      sx={{
                        ml: 'auto',
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 20px rgba(0,118,255,0.39)',
                        },
                      }}
                >
                      {isSubmitting ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} color="inherit" />
                          <span>Submitting...</span>
                        </Box>
                      ) : (
                        isEditing ? 'Update Feedback' : 'Submit Feedback'
                      )}
                </Button>
              )}
            </Box>
              </Box>
            </MotionPaper>
          </>
        )}

        <Snackbar
          open={toast.open}
          autoHideDuration={6000}
          onClose={handleToastClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              width: '100%',
              maxWidth: 500,
            },
          }}
        >
          <Alert
            onClose={handleToastClose}
            severity={toast.severity}
            variant="filled"
            elevation={6}
            sx={{
              width: '100%',
              borderRadius: 2,
              alignItems: 'center',
              '& .MuiAlert-icon': {
                fontSize: '2rem',
              },
              '& .MuiAlert-message': {
                fontSize: '1rem',
                fontWeight: 500,
              },
              '& .MuiAlert-action': {
                paddingTop: 0.5,
              },
              ...(toast.severity === 'success' && {
                backgroundImage: 'linear-gradient(45deg, #4caf50, #45a049)',
              }),
              ...(toast.severity === 'error' && {
                backgroundImage: 'linear-gradient(45deg, #f44336, #e53935)',
              }),
              ...(toast.severity === 'warning' && {
                backgroundImage: 'linear-gradient(45deg, #ff9800, #fb8c00)',
              }),
              ...(toast.severity === 'info' && {
                backgroundImage: 'linear-gradient(45deg, #2196f3, #1e88e5)',
              }),
            }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </MotionBox>
    </Container>
  );
};

export default FeedbackForm;