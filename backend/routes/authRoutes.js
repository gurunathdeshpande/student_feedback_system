const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const ErrorResponse = require('../utils/errorResponse');

// Register user
router.post('/register', async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      role,
      firstName,
      lastName,
      department,
      studentId,
      academicYear,
    } = req.body;

    // Basic validation
    if (!username || !email || !password || !role || !firstName || !lastName) {
      return next(new ErrorResponse('Please provide all required fields: username, email, password, role, firstName, lastName', 400));
    }

    // Password validation
    if (password.length < 6) {
      return next(new ErrorResponse('Password must be at least 6 characters long', 400));
    }

    // Role validation
    if (!['student', 'teacher'].includes(role)) {
      return next(new ErrorResponse('Role must be either student or teacher', 400));
    }

    // Role-specific validation
    if (role === 'student') {
      if (!studentId || !academicYear) {
        return next(new ErrorResponse('Student ID and Academic Year are required for students', 400));
      }
      if (!Number.isInteger(academicYear) || academicYear < 1 || academicYear > 4) {
        return next(new ErrorResponse('Academic Year must be a number between 1 and 4', 400));
      }
    }

    if (role === 'teacher' && !department) {
      return next(new ErrorResponse('Department is required for teachers', 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
        ...(role === 'student' ? [{ studentId }] : [])
      ]
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return next(new ErrorResponse('Email already registered', 400));
      }
      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return next(new ErrorResponse('Username already taken', 400));
      }
      if (role === 'student' && existingUser.studentId === studentId) {
        return next(new ErrorResponse('Student ID already registered', 400));
      }
    }

    // Create user with role-specific fields
    const userData = {
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };

    if (role === 'student') {
      userData.studentId = studentId.trim();
      userData.academicYear = academicYear;
    } else if (role === 'teacher') {
      userData.department = department;
    }

    const user = await User.create(userData);

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to Student Feedback System',
        message: `Welcome ${user.firstName}! Your account has been created successfully.`,
      });
    } catch (err) {
      console.log('Email could not be sent', err);
      // Don't return error - continue with registration
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ErrorResponse('Your account has been deactivated', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// Get current logged in user
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// Update user details
router.put('/me', protect, async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    };

    // Role-specific updates
    if (req.user.role === 'student' && req.body.academicYear) {
      fieldsToUpdate.academicYear = req.body.academicYear;
    } else if (req.user.role === 'teacher' && req.body.department) {
      fieldsToUpdate.department = req.body.department;
    }

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    next(err);
  }
});

// Update password
router.put('/updatepassword', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// Forgot password
router.post('/forgotpassword', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('No user found with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save();

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message,
      });

      res.json({
        success: true,
        message: 'Email sent',
      });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return next(new ErrorResponse('Email could not be sent', 500));
    }
  } catch (err) {
    next(err);
  }
});

// Reset password
router.put('/resetpassword/:resettoken', async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse('Invalid or expired token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// Get all teachers
router.get('/teachers', protect, async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('firstName lastName department _id')
      .sort('firstName');

    res.json({
      success: true,
      data: teachers
    });
  } catch (err) {
    next(err);
  }
});

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Use secure flag in production
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
};

module.exports = router; 