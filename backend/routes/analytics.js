const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');

// GET /api/analytics
// Get analytics data based on time range
router.get('/', auth, async (req, res) => {
  try {
    const { timeRange } = req.query;
    let startDate;
    const now = new Date();

    // Calculate start date based on time range
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7)); // Default to week
    }

    // Get feedback trends (submissions over time)
    const feedbackTrends = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          teacher: req.user.id // Only get feedback for this teacher
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    // Get rating distribution
    const ratingDistribution = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          teacher: req.user.id
        }
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert rating distribution to object format
    const ratingDistObj = ratingDistribution.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    // Get average rating trends
    const ratingTrends = await Feedback.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          teacher: req.user.id
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          averageRating: { $avg: "$rating" }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          averageRating: { $round: ["$averageRating", 1] }
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    // Get total stats
    const totalStats = await Feedback.aggregate([
      {
        $match: {
          teacher: req.user.id
        }
      },
      {
        $group: {
          _id: null,
          totalFeedbacks: { $sum: 1 },
          averageRating: { $avg: "$rating" }
        }
      },
      {
        $project: {
          _id: 0,
          totalFeedbacks: 1,
          averageRating: { $round: ["$averageRating", 1] }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalStats: totalStats[0] || { totalFeedbacks: 0, averageRating: 0 },
        feedbackTrends,
        ratingDistribution: ratingDistObj,
        ratingTrends
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching analytics data',
      error: error.message 
    });
  }
});

module.exports = router; 