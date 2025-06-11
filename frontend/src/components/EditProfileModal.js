import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const EditProfileModal = ({ open, onClose }) => {
  const { user, updateUser } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    profilePicture: user.profilePicture || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await axios.post('/api/auth/upload-profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          profilePicture: response.data.url,
        }));
        setError('');
      }
    } catch (error) {
      setError('Failed to upload image. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.put('/api/auth/update-profile', formData);
      
      if (response.data.success) {
        updateUser(response.data.data);
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1,
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Edit Profile</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={3}>
            {/* Profile Picture */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Box sx={{ position: 'relative' }}>
                {formData.profilePicture ? (
                  <Avatar
                    src={formData.profilePicture}
                    alt={formData.username}
                    sx={{ width: 100, height: 100 }}
                  />
                ) : (
                  <Avatar sx={{ width: 100, height: 100, bgcolor: theme.palette.primary.main }}>
                    {getInitials(formData.username)}
                  </Avatar>
                )}
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    right: -8,
                    bottom: -8,
                    bgcolor: theme.palette.background.paper,
                    boxShadow: theme.shadows[2],
                    '&:hover': {
                      bgcolor: theme.palette.background.paper,
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <PhotoCameraIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Form Fields */}
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </Stack>

              <TextField
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />

              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Stack>

            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{
            px: 3,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          }}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal; 