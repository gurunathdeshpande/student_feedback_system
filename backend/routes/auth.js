const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/profile-pictures';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: fileFilter
});

// Register user
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'student'
    });

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
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

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
      data: user
    });
  } catch (err) {
    next(err);
  }
});

// Update profile
router.put('/update-profile', protect, async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      username: req.body.username,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
});

// Upload profile picture
router.post('/upload-profile-picture', protect, upload.single('profilePicture'), async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        profilePicture: `/uploads/profile-pictures/${req.file.filename}`
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: user,
      url: `/uploads/profile-pictures/${req.file.filename}`
    });
  } catch (err) {
    next(err);
  }
});

// Get all teachers (for student feedback form)
router.get('/teachers', protect, async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('username firstName lastName email');

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

  res.status(statusCode).json({
    success: true,
      token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
};

module.exports = router; 