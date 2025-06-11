// Middleware to check if user is a teacher
exports.isTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Only teachers can access this resource.'
    });
  }
}; 