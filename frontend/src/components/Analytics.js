import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  useTheme,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Assessment,
  Star,
  TrendingUp,
  Refresh,
  AccessTime,
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const timeRangeOptions = [
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: 'year', label: 'Last Year' },
];

function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [stats, setStats] = useState({
    totalStats: { totalFeedbacks: 0, averageRating: 0 },
    feedbackTrends: [],
    ratingDistribution: {},
    ratingTrends: []
  });

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchAnalytics();
    }
  }, [user, selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics?timeRange=${selectedTimeRange}`);
      console.log('Analytics data:', response.data);
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  // Convert rating distribution object to array for chart
  const ratingDistributionData = Object.entries(stats.ratingDistribution).map(([rating, count]) => ({
    rating: Number(rating),
    count
  })).sort((a, b) => a.rating - b.rating);

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 3 }}>
        {/* Header Section */}
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
            Analytics Dashboard
      </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small">
              <InputLabel>Time Range</InputLabel>
              <Select
                value={selectedTimeRange}
                label="Time Range"
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                sx={{ minWidth: 120 }}
                startAdornment={<AccessTime sx={{ mr: 1 }} />}
              >
                {timeRangeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Refresh data">
              <IconButton 
                onClick={handleRefresh}
                sx={{ bgcolor: 'background.paper' }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              icon={<Assessment />}
              title="Total Feedbacks"
              value={stats.totalStats.totalFeedbacks}
              color="#2196F3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              icon={<Star />}
              title="Average Rating"
              value={stats.totalStats.averageRating.toFixed(1)}
              color="#00C49F"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              icon={<TrendingUp />}
              title="Recent Trend"
              value={stats.feedbackTrends[stats.feedbackTrends.length - 1]?.count || 0}
              color="#FFBB28"
            />
        </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Feedback Trends */}
          <Grid item xs={12} md={8}>
            <MotionPaper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Feedback Trends
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.feedbackTrends}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2196F3" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis />
                    <RechartsTooltip
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Submissions"
                      stroke="#2196F3"
                      fillOpacity={1}
                      fill="url(#colorCount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </MotionPaper>
      </Grid>

        {/* Rating Distribution */}
          <Grid item xs={12} md={4}>
            <MotionPaper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Rating Distribution
            </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                    <RechartsTooltip />
                <Legend />
                    <Bar dataKey="count" name="Feedbacks" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
              </Box>
            </MotionPaper>
        </Grid>

          {/* Rating Trends */}
          <Grid item xs={12}>
            <MotionPaper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Rating Trends
            </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.ratingTrends}>
                    <defs>
                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FFBB28" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis domain={[0, 5]} />
                    <RechartsTooltip
                      labelFormatter={(date) => format(new Date(date), 'MMM d, yyyy')}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="averageRating"
                      name="Average Rating"
                      stroke="#FFBB28"
                      fillOpacity={1}
                      fill="url(#colorRating)"
                    />
                  </AreaChart>
            </ResponsiveContainer>
              </Box>
            </MotionPaper>
        </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

const StatCard = ({ icon, title, value, color }) => {
  const theme = useTheme();
  
  return (
    <MotionPaper
      elevation={0}
      component={Card}
      sx={{
        height: '100%',
        borderRadius: 4,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
        },
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 600 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </CardContent>
    </MotionPaper>
  );
};

export default Analytics; 