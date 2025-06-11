import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  useTheme,
  ListItemButton,
  Stack,
  Badge,
  Tooltip,
  Fade,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Feedback as FeedbackIcon,
  ExitToApp as ExitToAppIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  ChevronLeft as ChevronLeftIcon,
  Brightness7 as Brightness7Icon,
  Brightness4 as Brightness4Icon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTheme as useCustomTheme } from '../context/ThemeContext';
import ProfileDropdown from './ProfileDropdown';

const DRAWER_WIDTH = 280;
const APPBAR_HEIGHT = 64; // Standard Material-UI AppBar height

function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const theme = useTheme();
  const { mode, toggleTheme } = useCustomTheme();

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
      roles: ['student', 'teacher'],
    },
    {
      text: 'Submit Feedback',
      icon: <FeedbackIcon />,
      path: '/feedback/new',
      roles: ['student'],
    },
    {
      text: 'Analytics',
      icon: <AssessmentIcon />,
      path: '/analytics',
      roles: ['teacher'],
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      roles: ['student', 'teacher'],
    },
    {
      text: 'Help & Support',
      icon: <HelpIcon />,
      path: '/help',
      roles: ['student', 'teacher'],
    },
  ];

  const drawer = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        mt: `${APPBAR_HEIGHT}px`, // Add margin top equal to AppBar height
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            boxShadow: theme.shadows[4],
          }}
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.dark',
              border: '2px solid',
              borderColor: 'primary.contrastText',
            }}
          >
          {user?.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {user?.username}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                display: 'inline-block',
              }}
            >
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
          </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mx: 2 }} />

      <List sx={{ px: 2, flex: 1, py: 2 }}>
        {menuItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item, index) => (
            <Fade in key={item.text} style={{ transitionDelay: `${index * 50}ms` }}>
              <ListItem disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={RouterLink}
                  to={item.path}
                  onClick={handleDrawerToggle}
                  sx={{
                    borderRadius: 2,
                    transition: 'all 0.2s ease-in-out',
                    '&.Mui-selected': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'inherit',
                      },
                    },
                    '&:hover': {
                      transform: 'translateX(8px)',
                      bgcolor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                  }}
                  selected={window.location.pathname === item.path}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 40,
                      color: window.location.pathname === item.path 
                        ? 'inherit' 
                        : 'primary.main'
                    }}
                  >
                    {item.icon}
              </ListItemIcon>
                  <ListItemText 
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: window.location.pathname === item.path ? 600 : 400,
                    }}
                  />
                </ListItemButton>
            </ListItem>
            </Fade>
          ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      <List sx={{ px: 2, pb: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: 'error.main',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'error.main',
                color: 'error.contrastText',
                transform: 'translateX(8px)',
                '& .MuiListItemIcon-root': {
                  color: 'inherit',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              <ExitToAppIcon />
          </ListItemIcon>
            <ListItemText 
              primary="Logout"
              primaryTypographyProps={{
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: '100%',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)'
            : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
            <IconButton
              color="inherit"
            aria-label="toggle drawer"
              edge="start"
              onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              transition: 'transform 0.2s',
              transform: isDrawerOpen ? 'rotate(180deg)' : 'none',
            }}
            >
              <MenuIcon />
            </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              letterSpacing: 0.5,
              background: 'linear-gradient(45deg, #fff, rgba(255,255,255,0.7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Student Feedback System
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
              <IconButton
                onClick={toggleTheme}
                color="inherit"
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': { transform: 'rotate(180deg)' },
                }}
              >
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            <ProfileDropdown />
          </Stack>
        </Toolbar>
      </AppBar>

        <Drawer
          variant="temporary"
          anchor="left"
        open={isDrawerOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
          keepMounted: true,
        }}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            border: 'none',
            boxShadow: theme.shadows[8],
            backgroundImage: theme.palette.mode === 'dark'
              ? 'linear-gradient(rgba(26, 32, 53, 0.7), rgba(26, 32, 53, 0.7))'
              : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(8px)',
            },
          }}
        >
          {drawer}
        </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          pt: `${APPBAR_HEIGHT + 24}px`, // Add padding top to account for AppBar height
        }}
      >
          {children}
      </Box>
    </Box>
  );
}

export default Layout; 