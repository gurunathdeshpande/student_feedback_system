import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AccountCircle,
  Edit as EditIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import EditProfileModal from './EditProfileModal';

const ProfileDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const theme = useTheme();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    handleClose();
    setEditModalOpen(true);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          ml: 2,
          background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)',
          '&:hover': {
            background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {user.profilePicture ? (
          <Avatar
            src={user.profilePicture}
            alt={user.username}
            sx={{ width: 32, height: 32 }}
          />
        ) : (
          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
            {getInitials(user.username)}
          </Avatar>
        )}
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxWidth: '100%',
            mt: 1.5,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              {user.profilePicture ? (
                <Avatar
                  src={user.profilePicture}
                  alt={user.username}
                  sx={{ width: 56, height: 56 }}
                />
              ) : (
                <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main }}>
                  {getInitials(user.username)}
                </Avatar>
              )}
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.5,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                    borderRadius: 1,
                    display: 'inline-block',
                    mt: 0.5,
                  }}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Box>

        <Divider />

        <MenuItem onClick={handleEditClick} sx={{ py: 1.5 }}>
          <EditIcon sx={{ mr: 2, fontSize: 20 }} />
          Edit Profile
        </MenuItem>

        <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
          <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
          Logout
        </MenuItem>
      </Menu>

      <EditProfileModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </>
  );
};

export default ProfileDropdown; 