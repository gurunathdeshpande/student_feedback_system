const express = require('express');
const {
  getFeedback,
  getSingleFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback
} = require('../controllers/feedbackController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.use(protect); // Protect all routes

router
  .route('/')
  .get(getFeedback)
  .post(authorize('student'), createFeedback);

router
  .route('/:id')
  .get(getSingleFeedback)
  .put(authorize('student', 'admin'), updateFeedback)
  .delete(authorize('student', 'admin'), deleteFeedback);

module.exports = router; 