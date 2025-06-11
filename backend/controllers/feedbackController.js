const Feedback = require('../models/Feedback');

// Create new feedback
exports.createFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.create({
      ...req.body,
      student: req.user.id
    });

    await feedback.populate('student teacher', 'username');
    
    res.status(201).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all feedback (with filters)
exports.getAllFeedback = async (req, res) => {
  try {
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'teacher') {
      query.teacher = req.user.id;
    }

    // Add status filter if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const feedback = await Feedback.find(query)
      .populate('student teacher', 'username')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get single feedback
exports.getFeedback = async (req, res) => {
    try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('student teacher', 'username');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user has permission to view this feedback
    if (req.user.role === 'student' && feedback.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this feedback'
      });
    }

    if (req.user.role === 'teacher' && feedback.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this feedback'
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update feedback
exports.updateFeedback = async (req, res) => {
  try {
    let feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user has permission to update this feedback
    if (req.user.role === 'student' && feedback.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback'
      });
    }

    if (req.user.role === 'teacher' && feedback.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this feedback'
      });
    }

    feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('student teacher', 'username');

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Check if user has permission to delete this feedback
    if (req.user.role === 'student' && feedback.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback'
      });
    }

    if (req.user.role === 'teacher' && feedback.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this feedback'
      });
    }

    await feedback.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
    }
};