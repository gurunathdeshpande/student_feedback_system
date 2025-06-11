const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Get all feedback
router.get('/', protect, async (req, res, next) => {
  try {
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } else if (req.user.role === 'teacher') {
      query.teacher = req.user.id;
    }

    const feedback = await Feedback.find(query)
      .populate('student', 'username firstName lastName')
      .populate('teacher', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
});

// Get analytics
router.get('/analytics', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'teacher') {
      return next(new ErrorResponse('Only teachers can access analytics', 403));
    }

    const feedback = await Feedback.find({ teacher: req.user.id })
      .populate('student', 'username firstName lastName')
      .populate('teacher', 'username firstName lastName')
      .sort({ createdAt: -1 });

    // Calculate analytics
    const totalFeedback = feedback.length;
    const averageRating = feedback.reduce((acc, curr) => acc + curr.rating, 0) / totalFeedback;
    const ratingDistribution = feedback.reduce((acc, curr) => {
      acc[curr.rating] = (acc[curr.rating] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalFeedback,
        averageRating,
        ratingDistribution,
        recentFeedback: feedback.slice(0, 5),
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get specific feedback
router.get('/:id', protect, async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('student', 'username firstName lastName')
      .populate('teacher', 'username firstName lastName');

    if (!feedback) {
      return next(new ErrorResponse('Feedback not found', 404));
    }

    // Check if user has permission to view this feedback
    if (req.user.role === 'student') {
      if (feedback.student._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to view this feedback', 403));
      }
    } else if (req.user.role === 'teacher') {
      if (feedback.teacher._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to view this feedback', 403));
      }
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    next(err);
  }
});

// Create feedback
router.post('/', protect, async (req, res, next) => {
  try {
    const { teacher, subject, content, rating, semester, academicYear } = req.body;

    // Validate required fields
    const requiredFields = {
      teacher: 'Teacher',
      subject: 'Subject',
      content: 'Feedback content',
      rating: 'Rating',
      semester: 'Semester',
      academicYear: 'Academic year'
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([field]) => !req.body[field])
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      return next(new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    // Validate semester
    const semesterNum = Number(semester);
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 4) {
      return next(new ErrorResponse('Invalid semester. Must be a number between 1 and 4', 400));
    }

    // Validate academic year format
    const academicYearRegex = /^\d{4}-\d{4}$/;
    if (!academicYearRegex.test(academicYear)) {
      return next(new ErrorResponse('Invalid academic year format. Must be in YYYY-YYYY format', 400));
    }

    // Validate academic year logic
    const [startYear, endYear] = academicYear.split('-').map(Number);
    if (endYear !== startYear + 1) {
      return next(new ErrorResponse('Invalid academic year. End year must be start year + 1', 400));
    }

    // Check if teacher exists
    const teacherExists = await User.findOne({ _id: teacher, role: 'teacher' });
    if (!teacherExists) {
      return next(new ErrorResponse('Invalid teacher selected', 400));
    }

    const feedback = new Feedback({
      student: req.user.id,
      teacher,
      subject,
      content,
      rating,
      status: 'pending',
      semester: semesterNum,
      academicYear,
    });

    await feedback.save();

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('student', 'username firstName lastName')
      .populate('teacher', 'username firstName lastName');

    res.status(201).json({
      success: true,
      data: populatedFeedback,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return next(new ErrorResponse(messages.join('. '), 400));
    }
    next(err);
  }
});

// Update feedback
router.put('/:id', protect, async (req, res, next) => {
  try {
    let feedback = await Feedback.findById(req.params.id)
      .populate('student', 'username firstName lastName')
      .populate('teacher', 'username firstName lastName');

    if (!feedback) {
      return next(new ErrorResponse('Feedback not found', 404));
    }

    // Check permissions
    if (req.user.role === 'student') {
      if (feedback.student._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this feedback', 403));
      }

      // Check if feedback is within editable timeframe (7 days)
      const feedbackAge = (Date.now() - feedback.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      if (feedbackAge > 7) {
        return next(new ErrorResponse('Feedback can only be edited within 7 days of creation', 403));
      }

      // Students can update these fields
      const allowedUpdates = ['content', 'rating', 'subject', 'semester', 'isAnonymous'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).populate('student', 'username firstName lastName')
       .populate('teacher', 'username firstName lastName');

    } else if (req.user.role === 'teacher') {
      if (feedback.teacher._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to update this feedback', 403));
      }

      // Teachers can only update status and add response
      const allowedUpdates = ['status', 'teacherResponse'];
      const updates = Object.keys(req.body)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});

      feedback = await Feedback.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      ).populate('student', 'username firstName lastName')
       .populate('teacher', 'username firstName lastName');
    }

    res.json({
      success: true,
      data: feedback,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(error => error.message);
      return next(new ErrorResponse(messages.join('. '), 400));
    }
    next(err);
  }
});

// Delete feedback
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return next(new ErrorResponse('Feedback not found', 404));
    }

    // Check if user has permission to delete this feedback
    if (
      (req.user.role === 'student' && feedback.student.toString() !== req.user.id) ||
      (req.user.role === 'teacher' && feedback.teacher.toString() !== req.user.id)
    ) {
      return next(new ErrorResponse('Not authorized to delete this feedback', 403));
    }

    await feedback.deleteOne();

    res.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;