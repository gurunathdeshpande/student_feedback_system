import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Rating,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Paper,
  Avatar,
  LinearProgress,
  Divider,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  Snackbar,
  Stack,
  InputBase,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment,
  Star,
  Comment,
  Person,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

function Dashboard() {
  const theme = useTheme();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [stats, setStats] = useState({
    totalFeedbacks: 0,
    averageRating: 0,
    pendingFeedbacks: 0,
    reviewedFeedbacks: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const calculateStats = (feedbackData) => {
    if (!Array.isArray(feedbackData) || feedbackData.length === 0) {
      return {
        totalFeedbacks: 0,
        averageRating: 0,
        pendingFeedbacks: 0,
        reviewedFeedbacks: 0,
      };
    }

    const totalCount = feedbackData.length;
    const validRatings = feedbackData.filter(f => typeof f.rating === 'number' && !isNaN(f.rating));
    const avgRating = validRatings.length > 0
      ? validRatings.reduce((acc, curr) => acc + curr.rating, 0) / validRatings.length
      : 0;
    
    const pending = feedbackData.filter(f => f.status === 'pending').length;
    const reviewed = feedbackData.filter(f => f.status === 'reviewed').length;

    return {
      totalFeedbacks: totalCount,
      averageRating: Number(avgRating.toFixed(1)),
      pendingFeedbacks: pending,
      reviewedFeedbacks: reviewed,
    };
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/feedback');
      const feedbackData = response.data.data;

      // Calculate and set statistics
      setStats(calculateStats(feedbackData));
      setFeedbacks(feedbackData || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || 'Failed to fetch feedbacks',
        severity: 'error',
      });
      // Reset stats and feedbacks on error
      setStats({
        totalFeedbacks: 0,
        averageRating: 0,
        pendingFeedbacks: 0,
        reviewedFeedbacks: 0,
      });
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const handleMenuOpen = (event, feedbackId) => {
    setAnchorEl(event.currentTarget);
    setSelectedFeedbackId(feedbackId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFeedbackId(null);
  };

  const handleEdit = (feedbackId) => {
    handleMenuClose();
    navigate(`/feedback/edit/${feedbackId}`);
  };

  const handleDelete = (feedback) => {
    setSelectedFeedback(feedback);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      const response = await axios.delete(`/api/feedback/${selectedFeedback._id}`);
      
      if (!response.data.success) {
        throw new Error('Failed to delete feedback');
      }

      setFeedbacks(feedbacks.filter((f) => f._id !== selectedFeedback._id));
      
      // Update statistics
      setStats(prev => ({
        ...prev,
        totalFeedbacks: prev.totalFeedbacks - 1,
        pendingFeedbacks: selectedFeedback.status === 'pending' ? prev.pendingFeedbacks - 1 : prev.pendingFeedbacks,
        reviewedFeedbacks: selectedFeedback.status === 'reviewed' ? prev.reviewedFeedbacks - 1 : prev.reviewedFeedbacks,
      }));

      setToast({
        open: true,
        message: 'Feedback deleted successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setToast({
        open: true,
        message: error.response?.data?.message || 'Failed to delete feedback',
        severity: 'error',
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedFeedback(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return theme.palette.warning.main;
      case 'reviewed':
        return theme.palette.success.main;
      case 'archived':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Comment />;
      case 'reviewed':
        return <Star />;
      case 'archived':
        return <DeleteIcon />;
      default:
        return null;
    }
  };

  const filteredFeedbacks = feedbacks
    .filter(feedback => {
      const matchesSearch = 
        (feedback.subject?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (feedback.content?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (feedback.student?.username?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'rating':
          return b.rating - a.rating;
        case 'subject':
          return (a.subject || '').localeCompare(b.subject || '');
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {user.role === 'student' ? 'My Feedback' : 'Student Feedback'}
        </Typography>
        {user.role === 'student' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/feedback/new')}
              sx={{
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
              Submit Feedback
          </Button>
        )}
      </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              icon={<Assessment />}
              title="Total Feedbacks"
              value={stats.totalFeedbacks}
              color="#2196F3"
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              icon={<Star />}
              title="Average Rating"
              value={stats.averageRating.toFixed(1)}
              color="#00C49F"
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              icon={<Comment />}
              title="Pending"
              value={stats.pendingFeedbacks}
              color="#FFBB28"
            />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              icon={<Star />}
              title="Reviewed"
              value={stats.reviewedFeedbacks}
              color="#FF8042"
            />
          </Grid>
        </Grid>

        {/* Filters */}
        <MotionPaper
          elevation={0}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
            boxShadow: theme.shadows[2],
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Paper
              sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: { xs: '100%', sm: 300 },
                borderRadius: 2,
              }}
            >
              <IconButton sx={{ p: '10px' }}>
                <SearchIcon />
              </IconButton>
              <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Paper>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
                startAdornment={<FilterIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="reviewed">Reviewed</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={<SortIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="date">Date</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="subject">Subject</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </MotionPaper>

      {/* Feedback List */}
        {filteredFeedbacks.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
          No feedback found. {user.role === 'student' && 'Click the button above to submit your first feedback!'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
            {filteredFeedbacks.map((feedback) => (
            <Grid item xs={12} md={6} key={feedback._id}>
                <MotionPaper
                  elevation={0}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  sx={{
                    borderRadius: 3,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
                    boxShadow: theme.shadows[2],
                    overflow: 'hidden',
                  }}
                >
                  <Box
                      sx={{ 
                      p: 2,
                      background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                      color: 'white',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {feedback.subject}
                        </Typography>
                      {(user.role === 'teacher' && feedback.teacher?._id === user.id) && (
                            <>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, feedback._id)}
                            sx={{ color: 'white' }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && selectedFeedbackId === feedback._id}
                                onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                              >
                            <MenuItem onClick={() => handleEdit(feedback._id)}>
                              <EditIcon sx={{ mr: 1 }} /> Edit
                                </MenuItem>
                            <MenuItem onClick={() => handleDelete(feedback)} sx={{ color: 'error.main' }}>
                              <DeleteIcon sx={{ mr: 1 }} /> Delete
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </Box>
                      </Box>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {feedback.content}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Rating value={feedback.rating} readOnly precision={0.5} />
                        <Typography variant="body2" color="text.secondary">
                          ({feedback.rating})
                      </Typography>
                      </Stack>
                    </Box>
                  <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: theme.palette.primary.main,
                          }}
                        >
                          {feedback.student?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {feedback.student?.username}
                  </Typography>
                          <Typography variant="caption" color="text.secondary">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        icon={getStatusIcon(feedback.status)}
                        label={feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                        sx={{
                          bgcolor: `${getStatusColor(feedback.status)}15`,
                          color: getStatusColor(feedback.status),
                          '& .MuiChip-icon': {
                            color: 'inherit',
                          },
                        }}
                        size="small"
                      />
                  </Box>
                </CardContent>
                </MotionPaper>
            </Grid>
          ))}
        </Grid>
      )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>Delete Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this feedback? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleToastClose}
          severity={toast.severity}
          sx={{ borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

// Motion Card Component
const MotionCard = ({ icon, title, value, color }) => {
  const theme = useTheme();
  
  return (
    <MotionPaper
      elevation={0}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        borderRadius: 3,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.paper',
        boxShadow: theme.shadows[2],
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${color}15`,
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Typography color="text.secondary" variant="subtitle2">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {value}
        </Typography>
      </CardContent>
    </MotionPaper>
  );
};

export default Dashboard; 