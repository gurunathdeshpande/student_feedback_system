const Feedback = require('../models/Feedback');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all feedback
// @route   GET /api/v1/feedback
// @access  Private
exports.getFeedback = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Feedback.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Feedback.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const feedback = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: feedback.length,
    pagination,
    data: feedback
  });
});

// @desc    Get single feedback
// @route   GET /api/v1/feedback/:id
// @access  Private
exports.getSingleFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: feedback
  });
});

// @desc    Create new feedback
// @route   POST /api/v1/feedback
// @access  Private
exports.createFeedback = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.student = req.user.id;

  const feedback = await Feedback.create(req.body);

  res.status(201).json({
    success: true,
    data: feedback
  });
});

// @desc    Update feedback
// @route   PUT /api/v1/feedback/:id
// @access  Private
exports.updateFeedback = asyncHandler(async (req, res, next) => {
  let feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is feedback owner
  if (feedback.student.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this feedback`, 401));
  }

  feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: feedback
  });
});

// @desc    Delete feedback
// @route   DELETE /api/v1/feedback/:id
// @access  Private
exports.deleteFeedback = asyncHandler(async (req, res, next) => {
  const feedback = await Feedback.findById(req.params.id);

  if (!feedback) {
    return next(new ErrorResponse(`Feedback not found with id of ${req.params.id}`, 404));
  }

  // Make sure user is feedback owner
  if (feedback.student.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete this feedback`, 401));
  }

  await feedback.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});