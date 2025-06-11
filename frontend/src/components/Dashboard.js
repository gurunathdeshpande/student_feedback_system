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
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleToastClose = () => {
    setToast({ ...toast, open: false });
  };

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/feedback');
      const feedbackData = response.data.data;
      setFeedbacks(feedbackData);
      
      // Calculate statistics
      const total = feedbackData.length;
      const avgRating = feedbackData.reduce((acc, curr) => acc + curr.rating, 0) / total || 0;
      const pending = feedbackData.filter(f => f.status === 'pending').length;
      const reviewed = feedbackData.filter(f => f.status === 'reviewed').length;
      
      setStats({
        totalFeedbacks: total,
        averageRating: avgRating,
        pendingFeedbacks: pending,
        reviewedFeedbacks: reviewed,
      });
    } catch (error) {
      setToast({
        open: true,
        message: 'Failed to fetch feedback',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event, feedbackId) => {
    setAnchorEl(event.currentTarget);
    setSelectedFeedbackId(feedbackId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFeedbackId(null);
  };

  const handleEdit = (feedback) => {
    handleMenuClose();
    navigate(`/feedback/edit/${feedback._id}`);
  };

  const handleDelete = (feedback) => {
    handleMenuClose();
    setSelectedFeedback(feedback);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/feedback/${selectedFeedback._id}`);
      setFeedbacks(feedbacks.filter((f) => f._id !== selectedFeedback._id));
      setToast({
        open: true,
        message: 'Feedback deleted successfully',
        severity: 'success'
      });
      
      // Update statistics
      setStats(prev => ({
        ...prev,
        totalFeedbacks: prev.totalFeedbacks - 1,
        pendingFeedbacks: selectedFeedback.status === 'pending' ? prev.pendingFeedbacks - 1 : prev.pendingFeedbacks,
        reviewedFeedbacks: selectedFeedback.status === 'reviewed' ? prev.reviewedFeedbacks - 1 : prev.reviewedFeedbacks,
      }));
    } catch (error) {
      setToast({
        open: true,
        message: 'Failed to delete feedback',
        severity: 'error'
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

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {user.role === 'student' ? 'My Feedback Dashboard' : 'Teacher Dashboard'}
        </Typography>
        {user.role === 'student' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/feedback/new')}
          >
            Submit New Feedback
          </Button>
        )}
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Total Feedbacks
                </Typography>
              </Box>
              <Typography variant="h3">{stats.totalFeedbacks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star color="primary" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Average Rating
                </Typography>
              </Box>
              <Typography variant="h3">
                {stats.averageRating.toFixed(1)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Comment color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h3">{stats.pendingFeedbacks}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star color="success" sx={{ mr: 1 }} />
                <Typography color="textSecondary">
                  Reviewed
                </Typography>
              </Box>
              <Typography variant="h3">{stats.reviewedFeedbacks}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Feedback List */}
      {feedbacks.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No feedback found. {user.role === 'student' && 'Click the button above to submit your first feedback!'}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {feedbacks.map((feedback) => (
            <Grid item xs={12} md={6} key={feedback._id}>
              <Card elevation={3}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main, 
                        mr: 2,
                        width: 56,
                        height: 56
                      }}
                    >
                      {feedback.teacher.username.charAt(0)}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="div">
                          {feedback.subject}
                        </Typography>
                        <Box>
                          <Chip
                            icon={getStatusIcon(feedback.status)}
                            label={feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                            sx={{ 
                              backgroundColor: getStatusColor(feedback.status),
                              color: '#fff'
                            }}
                            size="small"
                          />
                          {((user.role === 'student' && feedback.student._id === user.id) ||
                           (user.role === 'teacher' && feedback.teacher._id === user.id)) && (
                            <>
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, feedback._id)}
                                sx={{ ml: 1 }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl) && selectedFeedbackId === feedback._id}
                                onClose={handleMenuClose}
                              >
                                <MenuItem onClick={() => handleEdit(feedback)}>
                                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                                  Edit
                                </MenuItem>
                                <MenuItem onClick={() => handleDelete(feedback)}>
                                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                                  Delete
                                </MenuItem>
                              </Menu>
                            </>
                          )}
                        </Box>
                      </Box>
                      <Typography color="textSecondary" gutterBottom>
                        To: {feedback.teacher.username}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        From: {feedback.student.username}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {feedback.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Rating value={feedback.rating} readOnly precision={0.5} />
                    <Typography variant="caption" color="textSecondary">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Feedback</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this feedback? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
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
        <Alert onClose={handleToastClose} severity={toast.severity}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard; 