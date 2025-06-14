const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { register, login, getMe } = require('../controllers/authController');
const {
  createFeedback,
  getAllFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Feedback routes
router.route('/feedback')
  .post(protect, createFeedback)
  .get(protect, getAllFeedback);

router.route('/feedback/:id')
  .get(protect, getFeedback)
  .put(protect, updateFeedback)
  .delete(protect, deleteFeedback);

module.exports = router; 